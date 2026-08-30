"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Table2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AnalyticsData } from "@/actions/stats";

/**
 * Analytics dashboard.
 *
 * Every chart here is single-series, so identity comes from axis labels rather
 * than colour, and one hue is enough. Pipeline stages use an ordinal ramp of
 * that same hue (they are ordered, not independent categories).
 *
 * The ramps below are validated for both modes — monotone lightness, visible
 * step gaps, and a light end that clears the surface. Status colours are
 * deliberately NOT used for the stage bars: green/red adjacency is
 * indistinguishable for deuteranopic viewers, so status hues appear only on
 * tiles where a word carries the meaning.
 */
const VIZ_STYLES = `
.viz-root {
  --series-1: #2a78d6;
  --ordinal-1: #86b6ef;
  --ordinal-2: #5598e7;
  --ordinal-3: #2a78d6;
  --ordinal-4: #1c5cab;
  --ordinal-5: #104281;
  --viz-grid: #e1e0d9;
  --viz-axis: #898781;
  --viz-tooltip-bg: #ffffff;
  --viz-tooltip-ink: #0b0b0b;
}
.dark .viz-root {
  --series-1: #3987e5;
  --ordinal-1: #cde2fb;
  --ordinal-2: #9ec5f4;
  --ordinal-3: #6da7ec;
  --ordinal-4: #3987e5;
  --ordinal-5: #256abf;
  --viz-grid: #2c2c2a;
  --viz-axis: #898781;
  --viz-tooltip-bg: #1b1d25;
  --viz-tooltip-ink: #ffffff;
}
`;

const ORDINAL = [
  "var(--ordinal-1)",
  "var(--ordinal-2)",
  "var(--ordinal-3)",
  "var(--ordinal-4)",
  "var(--ordinal-5)",
];

const axisProps = {
  stroke: "var(--viz-axis)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ value: number | string; name?: string }>;
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-md"
      style={{
        background: "var(--viz-tooltip-bg)",
        color: "var(--viz-tooltip-ink)",
        borderColor: "var(--viz-grid)",
      }}
    >
      <p className="font-semibold">{label}</p>
      <p className="text-[11px] opacity-80">
        {payload[0].value}
        {suffix}
      </p>
    </div>
  );
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [showTable, setShowTable] = useState(false);

  const hasApplications = data.totals.applications > 0;
  const hasAnalyses = data.totals.analyses > 0;

  if (!hasApplications && !hasAnalyses) {
    return (
      <EmptyState
        title="No data to chart yet"
        body="Analytics builds itself from your job analyses and tracked applications. Run an analysis or add an application and this page fills in."
      />
    );
  }

  return (
    <div className="viz-root space-y-6">
      <style>{VIZ_STYLES}</style>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Applications" value={data.totals.applications} />
        <StatTile
          label="Avg. match score"
          value={data.totals.averageMatchScore}
          suffix="%"
        />
        <StatTile
          label="Response rate"
          value={data.totals.responseRate}
          suffix="%"
          hint="Share of sent applications that got any reply"
        />
        <StatTile
          label="Interview rate"
          value={data.totals.interviewRate}
          suffix="%"
          hint="Sent applications reaching interview or offer"
        />
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowTable((v) => !v)}>
          {showTable ? (
            <>
              <BarChart3 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Show charts
            </>
          ) : (
            <>
              <Table2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Show data table
            </>
          )}
        </Button>
      </div>

      {showTable ? (
        <DataTables data={data} />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartCard
            title="Application pipeline"
            subtitle="Where your applications currently sit"
          >
            {hasApplications ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.funnel}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--viz-grid)"
                    strokeDasharray="3 3"
                  />
                  <XAxis type="number" allowDecimals={false} {...axisProps} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={78}
                    {...axisProps}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.3 }}
                    content={<ChartTooltip />}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={22}>
                    {data.funnel.map((entry, i) => (
                      <Cell key={entry.status} fill={ORDINAL[i % ORDINAL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <InlineEmpty text="No applications tracked yet." />
            )}
          </ChartCard>

          <ChartCard
            title="Applications over time"
            subtitle="How consistently you're applying"
          >
            {data.applicationsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={data.applicationsOverTime}
                  margin={{ left: 0, right: 16, top: 8, bottom: 4 }}
                >
                  <CartesianGrid stroke="var(--viz-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis allowDecimals={false} width={32} {...axisProps} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--series-1)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--series-1)", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <InlineEmpty text="No applications tracked yet." />
            )}
          </ChartCard>

          <ChartCard
            title="Match score distribution"
            subtitle="How well your resume fits the roles you target"
          >
            {hasAnalyses ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.scoreDistribution}
                  margin={{ left: 0, right: 16, top: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--viz-grid)"
                    strokeDasharray="3 3"
                  />
                  <XAxis dataKey="bucket" {...axisProps} />
                  <YAxis allowDecimals={false} width={32} {...axisProps} />
                  <Tooltip
                    cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.3 }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--series-1)"
                    radius={[4, 4, 0, 0]}
                    barSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <InlineEmpty text="No analyses run yet." />
            )}
          </ChartCard>

          <ChartCard
            title="Most common skill gaps"
            subtitle="Skills the AI flagged as missing, across all analyses"
          >
            {data.skillGaps.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.skillGaps}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--viz-grid)"
                    strokeDasharray="3 3"
                  />
                  <XAxis type="number" allowDecimals={false} {...axisProps} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={110}
                    {...axisProps}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--viz-grid)", fillOpacity: 0.3 }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--series-1)"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <InlineEmpty text="Run a few analyses to see recurring gaps." />
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix = "",
  hint,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4" title={hint}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
        {value === null ? "—" : `${value}${suffix}`}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>
      {children}
    </section>
  );
}

function InlineEmpty({ text }: { text: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
      <BarChart3
        className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
          Run an analysis
        </Link>
        <Link
          href="/dashboard/applications"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          Track an application
        </Link>
      </div>
    </div>
  );
}

/** Text equivalent of every chart — the accessibility relief path. */
function DataTables({ data }: { data: AnalyticsData }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <SimpleTable
        title="Application pipeline"
        columns={["Stage", "Count"]}
        rows={data.funnel.map((f) => [f.label, String(f.count)])}
      />
      <SimpleTable
        title="Applications over time"
        columns={["Month", "Count"]}
        rows={data.applicationsOverTime.map((d) => [d.month, String(d.count)])}
      />
      <SimpleTable
        title="Match score distribution"
        columns={["Score range", "Analyses"]}
        rows={data.scoreDistribution.map((d) => [d.bucket, String(d.count)])}
      />
      <SimpleTable
        title="Most common skill gaps"
        columns={["Skill", "Times flagged"]}
        rows={data.skillGaps.map((d) => [d.skill, String(d.count)])}
      />
    </div>
  );
}

function SimpleTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((c) => (
                <th key={c} className="pb-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-3 text-muted-foreground"
                >
                  No data yet.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`py-2 ${j === 0 ? "text-foreground" : "tabular-nums text-muted-foreground"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

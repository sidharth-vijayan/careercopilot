"use client";

import { useState } from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApplicationStore } from "@/lib/store/applications";
import { AddApplicationModal } from "@/components/dashboard/add-application-modal";
import { ApplicationStatus } from "@/types";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  saved: {
    label: "Saved",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  applied: {
    label: "Applied",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  interview: {
    label: "Interview",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  offer: {
    label: "Offer",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
};

const allStatuses: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export default function ApplicationsPage() {
  const { applications, updateStatus, deleteApplication } =
    useApplicationStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Application Tracker
          </h2>
          <p className="text-muted-foreground">
            {applications.length === 0
              ? "Start tracking your job applications."
              : `Tracking ${applications.length} application${applications.length !== 1 ? "s" : ""}.`}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Filters */}
      {applications.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company..."
              className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterStatus === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              All ({applications.length})
            </button>
            {allStatuses.map((s) => {
              const count = applications.filter(
                (a) => a.status === s
              ).length;
              if (count === 0) return null;
              const cfg = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filterStatus === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No applications yet
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Start by analyzing a resume against a job description, then click
            &quot;Track Application&quot; to add it here.
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Application
          </Button>
        </div>
      )}

      {/* Application Cards */}
      {filtered.length > 0 && (
        <div className="grid gap-4">
          {filtered.map((app) => {
            const cfg = statusConfig[app.status];
            return (
              <div
                key={app.id}
                className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {app.jobTitle}
                      </h3>
                      {/* Status dropdown */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === app.id ? null : app.id
                            )
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
                        >
                          {cfg.label}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {openDropdown === app.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute top-full left-0 mt-1 z-20 w-36 rounded-lg border bg-card shadow-lg py-1">
                              {allStatuses.map((s) => {
                                const sc = statusConfig[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={() => {
                                      updateStatus(app.id, s);
                                      setOpenDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                                      app.status === s
                                        ? "font-medium " + sc.color
                                        : "text-foreground"
                                    }`}
                                  >
                                    {sc.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {app.company}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {app.matchScore !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${app.matchScore}%` }}
                            />
                          </div>
                          <span className="font-medium">
                            {app.matchScore}% match
                          </span>
                        </span>
                      )}
                    </div>

                    {app.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        &ldquo;{app.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => deleteApplication(app.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results for filter */}
      {applications.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No applications match your search.
        </div>
      )}

      <AddApplicationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

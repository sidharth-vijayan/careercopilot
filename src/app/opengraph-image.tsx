import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CareerCopilot - Land your dream job with AI precision";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #09090b, #18181b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#2563eb",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2" />
              <path d="M8 17h2" />
              <path d="M14 13h2" />
              <path d="M14 17h2" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.05em",
              margin: 0,
            }}
          >
            CareerCopilot
          </h1>
        </div>

        <p
          style={{
            fontSize: "42px",
            fontWeight: 500,
            color: "#a1a1aa",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: "900px",
            margin: 0,
          }}
        >
          Land your dream job with AI precision. Automatically tailor resumes and
          track applications.
        </p>

        <div
          style={{
            display: "flex",
            marginTop: "60px",
            background: "rgba(37, 99, 235, 0.2)",
            color: "#60a5fa",
            padding: "12px 32px",
            borderRadius: "9999px",
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          100% Free Forever
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

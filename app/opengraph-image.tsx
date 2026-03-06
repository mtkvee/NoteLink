import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, rgb(245, 247, 250), rgb(225, 231, 237))",
          color: "#111827",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "18px",
                background: "#606060",
              }}
            />
            <span>{siteConfig.name}</span>
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              background: "rgba(96, 96, 96, 0.12)",
              fontSize: 24,
            }}
          >
            Plain text sharing
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "920px",
          }}
        >
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05 }}>
            Share notes with a clean link.
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.35, color: "#374151" }}>
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

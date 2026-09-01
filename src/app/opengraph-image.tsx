import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — Computer Engineering at UCF, working across hardware, embedded, software, machine learning, and systems`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated at build time so the social card always matches the site's copy. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080a",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              border: "1px solid #2f2f38",
              color: "#f2f2f4",
              fontSize: 16,
              letterSpacing: 1,
            }}
          >
            {site.initials}
          </div>
          <div style={{ display: "flex", color: "#82828d", fontSize: 20, letterSpacing: 3 }}>
            COMPUTER ENGINEERING · UCF · &apos;27
          </div>
        </div>

        {/* Mirrors the hero: the name carries the card, the layer row below
            says what the name does. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#f2f2f4", fontSize: 104, lineHeight: 1.02 }}>
            {site.name}
          </div>
          <div style={{ display: "flex", color: "#a3a3ad", fontSize: 30, marginTop: 18 }}>
            From transistors up to cloud services.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#82828d", fontSize: 22 }}>
          {["Hardware", "Embedded", "Software", "ML", "Systems"].map((layer, index) => (
            <div key={layer} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {index > 0 ? <div style={{ display: "flex", color: "#a78bff" }}>→</div> : null}
              <div style={{ display: "flex" }}>{layer}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

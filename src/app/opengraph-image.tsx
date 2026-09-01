import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — I build across the stack`;
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
          <div style={{ display: "flex", color: "#7c7c87", fontSize: 20, letterSpacing: 3 }}>
            {site.name.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#f2f2f4", fontSize: 92, lineHeight: 1.05 }}>
            I build across
          </div>
          <div style={{ display: "flex", color: "#a78bff", fontSize: 92, lineHeight: 1.05 }}>
            the stack.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#7c7c87", fontSize: 22 }}>
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

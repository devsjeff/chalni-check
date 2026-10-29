import { ImageResponse } from "next/og";

export const alt = "Karwa Chauth Ki Kasam — Single ho? Fake husband ready hai!";
export const size = { width: 1200, height: 630 };
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
          justifyContent: "center",
          background: "linear-gradient(160deg, #2A0610 0%, #6B0F1A 48%, #C43166 100%)",
          color: "#FFF5E6",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 3, color: "#FFB347" }}>
          NO LOGIN · JUST VIBES
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          Karwa Chauth Ki Kasam
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 36 }}>
          Single ho? Fake husband ready hai!
        </div>
      </div>
    ),
    { ...size },
  );
}

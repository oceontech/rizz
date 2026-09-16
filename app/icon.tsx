import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: o "R" da marca em âmbar sobre o vinho — cores do arquivo real. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#70012a",
          color: "#e8890c",
          fontSize: 24,
          fontFamily: "Georgia, serif",
        }}
      >
        R
      </div>
    ),
    size,
  );
}

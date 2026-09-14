import { ImageResponse } from "next/og";
import { IconeApplication } from "@/lib/pwaIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<IconeApplication taille={180} />, size);
}

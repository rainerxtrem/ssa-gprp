import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { IconeApplication } from "@/lib/pwaIcon";

export async function GET(request: NextRequest) {
  const tailleParam = request.nextUrl.searchParams.get("size");
  const taille = tailleParam === "512" ? 512 : 192;

  return new ImageResponse(<IconeApplication taille={taille} />, { width: taille, height: taille });
}

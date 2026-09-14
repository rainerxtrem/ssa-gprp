import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SSA GPRP — Suivi médical",
    short_name: "SSA GPRP",
    description: "Application de suivi médical du Service de Santé des Armées",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#047857",
    icons: [
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/api/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baraholka.md",
    short_name: "Baraholka",
    description: "Современный маркетплейс объявлений для Молдовы.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f3",
    theme_color: "#111318",
    categories: ["shopping", "business", "lifestyle"],
    lang: "ru-MD",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}

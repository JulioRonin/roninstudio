import type { MetadataRoute } from "next";

// Musashi como app instalable (Android, iPhone, computadora).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Musashi · Ronin Studio",
    short_name: "Musashi",
    description: "Plataforma interna de Ronin Studio.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0C0F14",
    theme_color: "#0C0F14",
    lang: "es-MX",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Bandeja de aprobación", url: "/agentes" },
      { name: "Cotizaciones", url: "/cotizaciones" },
      { name: "Tareas", url: "/tareas" },
    ],
  };
}

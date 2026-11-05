import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Exportación estática: hoy todo Musashi corre en el navegador (modo demo).
  // Cuando entre Supabase con sesión del lado del servidor, quitar `output`
  // y fijar la raíz `musashi/` en el proyecto de Vercel.
  output: "export",
  trailingSlash: true,
  // El diseño de referencia (musashi/design) no forma parte del build.
  outputFileTracingExcludes: { "*": ["./design/**"] },
};

export default nextConfig;

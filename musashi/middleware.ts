import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, configurado, tokenValido } from "@/lib/sesion";

// Todo Musashi pide sesión, salvo el login y las rutas que usan los agentes de Hermes,
// que se autentican en el propio handler con Authorization: Bearer MUSASHI_API_KEY.
const ABIERTAS = ["/login", "/api/login", "/api/logout"];
const AGENTES = ["/api/hermes/propuestas", "/api/hermes/contexto", "/api/hermes/corridas", "/api/cron/resumen"];
// Públicas: la liga privada de una cotización (firma en la URL) y lo que manda el sitio público.
const PUBLICAS = ["/c/", "/api/publico/"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const api = pathname.startsWith("/api/");
  if (AGENTES.some((p) => pathname === p)) return NextResponse.next();
  if (PUBLICAS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const ok = await tokenValido(req.cookies.get(COOKIE)?.value);
  if (pathname === "/login" && ok) return NextResponse.redirect(new URL("/", req.url));
  if (ABIERTAS.includes(pathname)) return NextResponse.next();
  if (ok) return NextResponse.next();

  // En desarrollo local sin variables se deja pasar; en Vercel, sin variables, nadie entra.
  if (!configurado() && process.env.NODE_ENV === "development") return NextResponse.next();

  if (api) return NextResponse.json({ error: "sesión requerida" }, { status: 401 });
  const url = new URL("/login", req.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|offline\\.html|.*\\.(?:webp|png|jpg|jpeg|svg|ico|txt)$).*)"],
};

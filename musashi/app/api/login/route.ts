import { NextResponse } from "next/server";
import { COOKIE, DURACION_S, configurado, crearToken, destinoSeguro, passwordCorrecta } from "@/lib/sesion";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!configurado()) return NextResponse.json({ error: "Falta configurar MUSASHI_PASSWORD y MUSASHI_SESSION_SECRET en Vercel." }, { status: 503 });
  let body: { password?: unknown; next?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!(await passwordCorrecta(typeof body.password === "string" ? body.password : ""))) {
    await new Promise((r) => setTimeout(r, 900)); // frena intentos repetidos
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, next: destinoSeguro(typeof body.next === "string" ? body.next : null) });
  res.cookies.set(COOKIE, await crearToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: DURACION_S });
  return res;
}

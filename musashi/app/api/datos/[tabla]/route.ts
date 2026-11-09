import { NextResponse, type NextRequest } from "next/server";
import { ErrorDB, TABLAS, VISTAS, hayDB, sb } from "@/lib/db";

export const dynamic = "force-dynamic";

// API de datos de Musashi. Sólo con sesión (lo exige el middleware) y sólo sobre tablas conocidas.
// Los filtros van en la URL con la sintaxis de PostgREST: ?select=*&id=eq.<uuid>&order=creado_en.desc
// Sin Supabase configurado responde { db: false } y las pantallas siguen en modo demo.

type Ctx = { params: Promise<{ tabla: string }> };
const NO_FILTRO = new Set(["select", "order", "limit", "offset", "upsert", "on_conflict", "columns"]);

async function preparar(req: NextRequest, ctx: Ctx, escribe: boolean) {
  const { tabla } = await ctx.params;
  if (!TABLAS.has(tabla)) return { error: NextResponse.json({ error: `tabla desconocida: ${tabla}` }, { status: 404 }) };
  if (escribe && VISTAS.has(tabla)) return { error: NextResponse.json({ error: "las vistas son de sólo lectura" }, { status: 405 }) };
  const q = new URLSearchParams(req.nextUrl.searchParams);
  const upsert = q.get("upsert"); q.delete("upsert");
  const filtrada = [...q.keys()].some((k) => !NO_FILTRO.has(k));
  return { tabla, q, upsert, filtrada };
}

const fallo = (e: unknown) => NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: e instanceof ErrorDB ? (e.status >= 500 ? 502 : e.status) : 500 });
const cuerpo = async (req: NextRequest) => { try { return await req.json(); } catch { return undefined; } };

export async function GET(req: NextRequest, ctx: Ctx) {
  const p = await preparar(req, ctx, false); if (p.error) return p.error;
  if (!hayDB()) return NextResponse.json({ db: false, filas: [] });
  try { return NextResponse.json({ db: true, filas: await sb(`${p.tabla}?${p.q}`) }); } catch (e) { return fallo(e); }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const p = await preparar(req, ctx, true); if (p.error) return p.error;
  if (!hayDB()) return NextResponse.json({ db: false, filas: [] });
  const body = await cuerpo(req); if (!body || typeof body !== "object") return NextResponse.json({ error: "cuerpo JSON requerido" }, { status: 400 });
  if (p.upsert) p.q.set("on_conflict", p.upsert);
  const prefer = ["return=representation", p.upsert ? "resolution=merge-duplicates" : ""].filter(Boolean).join(",");
  try { return NextResponse.json({ db: true, filas: await sb(`${p.tabla}?${p.q}`, { method: "POST", body, prefer }) }, { status: 201 }); } catch (e) { return fallo(e); }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const p = await preparar(req, ctx, true); if (p.error) return p.error;
  if (!p.filtrada) return NextResponse.json({ error: "PATCH requiere un filtro (p. ej. ?id=eq.<uuid>)" }, { status: 400 });
  if (!hayDB()) return NextResponse.json({ db: false, filas: [] });
  const body = await cuerpo(req); if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "cuerpo JSON requerido" }, { status: 400 });
  try { return NextResponse.json({ db: true, filas: await sb(`${p.tabla}?${p.q}`, { method: "PATCH", body, prefer: "return=representation" }) }); } catch (e) { return fallo(e); }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const p = await preparar(req, ctx, true); if (p.error) return p.error;
  if (!p.filtrada) return NextResponse.json({ error: "DELETE requiere un filtro (p. ej. ?id=eq.<uuid>)" }, { status: 400 });
  if (!hayDB()) return NextResponse.json({ db: false, filas: [] });
  try { return NextResponse.json({ db: true, filas: await sb(`${p.tabla}?${p.q}`, { method: "DELETE", prefer: "return=representation" }) }); } catch (e) { return fallo(e); }
}

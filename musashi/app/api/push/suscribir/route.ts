import { NextResponse, type NextRequest } from "next/server";
import { hayDB, sb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Guarda (POST) o quita (DELETE ?id= o ?endpoint=) la suscripción push de un dispositivo. Sólo con sesión. */
export async function POST(req: NextRequest) {
  if (!hayDB()) return NextResponse.json({ error: "sin base de datos" }, { status: 503 });
  let b: { subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } }; dispositivo?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const s = b.subscription;
  if (!s?.endpoint || !/^https:\/\//.test(s.endpoint) || !s.keys?.p256dh || !s.keys?.auth) return NextResponse.json({ error: "suscripción incompleta" }, { status: 400 });
  try {
    await sb("push_suscripciones?on_conflict=endpoint", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: { endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth, dispositivo: String(b.dispositivo ?? "").slice(0, 80) || null } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 }); }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id"), endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!hayDB() || (!id && !endpoint)) return NextResponse.json({ error: "falta id o endpoint" }, { status: 400 });
  try { await sb(`push_suscripciones?${id ? `id=eq.${encodeURIComponent(id)}` : `endpoint=eq.${encodeURIComponent(endpoint!)}`}`, { method: "DELETE" }); return NextResponse.json({ ok: true }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 }); }
}

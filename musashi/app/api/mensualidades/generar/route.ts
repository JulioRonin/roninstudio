import { NextResponse } from "next/server";
import { hayDB } from "@/lib/db";
import { generarMensualidades } from "@/lib/mensualidades";

export const dynamic = "force-dynamic";

/** Crea las facturas de las mensualidades cuyo día de cobro ya llegó. Sólo con sesión (middleware).
 *  La llaman el tablero y Facturación al abrir; repetirla no duplica nada.
 *  lista:false = falta correr supabase/migrations/0002_mensualidades.sql. */
export async function POST() {
  if (!hayDB()) return NextResponse.json({ db: false, lista: false, generadas: [] });
  try { return NextResponse.json({ db: true, ...(await generarMensualidades()) }); }
  catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 }); }
}

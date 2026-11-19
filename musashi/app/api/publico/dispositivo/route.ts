import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_PROPIO, DURACION_PROPIO_S, firmaValida, firmar } from "@/lib/sesion";
import { ciudadDe, dispositivoDe, navegadorDe } from "@/lib/aperturas-base";

export const dynamic = "force-dynamic";

/** Marca (o desmarca) este navegador como tuyo para que tus aperturas de cotizaciones no cuenten.
 *  Se abre en el dominio público (www.roninstudio.com.mx/api/publico/dispositivo):
 *  - ?p=<pase>  marca el navegador (el pase sale de Musashi → Configuración → Tus dispositivos y dura 30 min)
 *  - ?quitar=1  quita la marca
 *  - sin nada   dice si este navegador está marcado */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const ua = req.headers.get("user-agent") ?? "";
  const este = [dispositivoDe(ua), navegadorDe(ua), ciudadDe(req.headers)].filter(Boolean).join(" · ");
  const opts = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

  if (q.get("quitar")) {
    const res = pagina("Marca quitada", `Este navegador (${este}) ya no está marcado como tuyo: si abres una cotización desde aquí, contará como apertura del cliente.`);
    res.cookies.set(COOKIE_PROPIO, "", { ...opts, maxAge: 0 });
    return res;
  }
  const pase = q.get("p");
  if (pase) {
    if (!(await firmaValida("pase-propio", pase))) return pagina("La liga ya no sirve", "Esta liga para marcar el navegador venció o no es válida. Genera otra en Musashi → Configuración → Tus dispositivos; dura 30 minutos.", 400);
    const res = pagina("Listo: este navegador es tuyo", `Marcamos este navegador (${este}). Cuando abras una cotización desde aquí, Musashi la registra como tuya y no como apertura del cliente. Si también abres ligas desde otro navegador o desde otra app, márcalo igual.`);
    res.cookies.set(COOKIE_PROPIO, await firmar("propio", DURACION_PROPIO_S), { ...opts, maxAge: DURACION_PROPIO_S });
    return res;
  }
  const marcado = await firmaValida("propio", req.cookies.get(COOKIE_PROPIO)?.value);
  return marcado
    ? pagina("Este navegador es tuyo", `Este navegador (${este}) está marcado: tus aperturas de cotizaciones no cuentan como del cliente.`, 200, true)
    : pagina("Este navegador no está marcado", `Si abres una cotización desde este navegador (${este}), contará como apertura del cliente. Para marcarlo, abre aquí la liga que genera Musashi → Configuración → Tus dispositivos.`);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function pagina(titulo: string, texto: string, status = 200, quitar = false) {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titulo)} · Musashi</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0C0F14;color:#EEEBE4;font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px;box-sizing:border-box}main{max-width:460px}small{display:block;font:500 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;color:#A9A6A0;margin-bottom:14px}h1{font-size:26px;line-height:1.15;margin:0 0 12px}p{color:#C9C5BD;margin:0 0 18px}a{color:#EEEBE4}</style></head>
<body><main><small>MUSASHI · TUS DISPOSITIVOS</small><h1>${esc(titulo)}</h1><p>${esc(texto)}</p>${quitar ? `<p><a href="?quitar=1">Quitar la marca de este navegador</a></p>` : ""}<p style="font-size:13px;color:#A9A6A0">Ya puedes cerrar esta página.</p></main></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

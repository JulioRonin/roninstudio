// Describe el navegador de quien abrió una cotización a partir del User-Agent, sin guardar el texto completo.
// Lógica pura: se usa en el servidor y se prueba sola.

export function dispositivoDe(ua: string): string {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? "Android" : "Tableta Android";
  if (/CrOS/.test(ua)) return "Chromebook";
  if (/Macintosh|Mac OS X/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Otro";
}

export function navegadorDe(ua: string): string {
  if (/WhatsApp/i.test(ua)) return "WhatsApp";
  if (/FBAN|FBAV|FB_IAB|Instagram/.test(ua)) return "Facebook o Instagram";
  if (/; wv\)/.test(ua)) return "Navegador dentro de una app";
  if (/iPhone|iPad/.test(ua) && !/Safari\//.test(ua)) return "Navegador dentro de una app";
  if (/Edg(A|iOS)?\//.test(ua)) return "Edge";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/CriOS|Chrome\//.test(ua)) return "Chrome";
  if (/FxiOS|Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Otro";
}

/** Ciudad aproximada que calcula Vercel por la IP (no guardamos la IP). */
export function ciudadDe(h: { get(n: string): string | null }): string | null {
  const c = h.get("x-vercel-ip-city");
  if (!c) return null;
  try { return decodeURIComponent(c).slice(0, 80) || null; } catch { return null; }
}

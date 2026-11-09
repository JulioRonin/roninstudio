// Sesión de Musashi: un solo usuario, contraseña en MUSASHI_PASSWORD y cookie firmada con MUSASHI_SESSION_SECRET.
// Usa Web Crypto para funcionar igual en el middleware (edge) y en los route handlers (node).
// Cuando exista Supabase, esto se reemplaza por Supabase Auth.

export const COOKIE = "musashi_sesion";
export const DURACION_S = 60 * 60 * 24 * 30; // 30 días

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");

export const configurado = () => Boolean(process.env.MUSASHI_PASSWORD && process.env.MUSASHI_SESSION_SECRET);

async function hmac(secret: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(msg)));
}

/** Comparación en tiempo constante de dos cadenas de igual longitud. */
function igual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Compara la contraseña escrita con MUSASHI_PASSWORD sin filtrar su longitud. */
export async function passwordCorrecta(intento: string) {
  const real = process.env.MUSASHI_PASSWORD ?? "";
  if (!real || !intento) return false;
  const h = async (s: string) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
  return igual(await h(intento), await h(real));
}

export async function crearToken() {
  const exp = Math.floor(Date.now() / 1000) + DURACION_S;
  return `${exp}.${await hmac(process.env.MUSASHI_SESSION_SECRET ?? "", `musashi:${exp}`)}`;
}

export async function tokenValido(t?: string | null) {
  const secret = process.env.MUSASHI_SESSION_SECRET ?? "";
  if (!t || !secret) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return igual(sig, await hmac(secret, `musashi:${exp}`));
}

/** Sólo rutas internas: evita redirecciones abiertas a otros dominios. */
export const destinoSeguro = (n?: string | null) => (n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/api/") ? n : "/");

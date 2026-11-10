// Liga privada de una cotización para el cliente: /c/<folio>.<firma>
// La firma es un HMAC del folio con MUSASHI_SESSION_SECRET, así que no se puede adivinar
// ni requiere guardar nada en la base. Sólo se usa en el servidor.
import { createHmac, timingSafeEqual } from "crypto";

const firma = (folio: string) => createHmac("sha256", process.env.MUSASHI_SESSION_SECRET ?? "").update("cotizacion:" + folio).digest("hex").slice(0, 24);

export const refDe = (folio: string) => `${folio}.${firma(folio)}`;

/** Devuelve el folio si la referencia es válida; si no, null. */
export function folioDe(ref: string): string | null {
  if (!process.env.MUSASHI_SESSION_SECRET) return null;
  const i = ref.lastIndexOf(".");
  if (i < 1) return null;
  const folio = ref.slice(0, i), sig = ref.slice(i + 1), ok = firma(folio);
  if (sig.length !== ok.length || !/^[A-Za-z0-9-]{1,24}$/.test(folio)) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(ok)) ? folio : null;
}

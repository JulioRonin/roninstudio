import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/sesion";

export const dynamic = "force-dynamic";

function salir(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url), 303);
  res.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
export const GET = salir;
export const POST = salir;

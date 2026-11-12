import { NextResponse } from "next/server";
import { AUTH_COOKIE, FLAG_COOKIE, passwordMatches, tokenFor } from "@/lib/auth";

export async function POST(req: Request) {
  if (!process.env.EDIT_PASSWORD) {
    return NextResponse.json({ error: "EDIT_PASSWORD is not set on the server." }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || !passwordMatches(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  const common = { path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 };
  res.cookies.set(AUTH_COOKIE, tokenFor(process.env.EDIT_PASSWORD), { ...common, httpOnly: true });
  res.cookies.set(FLAG_COOKIE, "1", common);
  return res;
}

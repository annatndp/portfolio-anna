import { NextResponse } from "next/server";
import { AUTH_COOKIE, FLAG_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE);
  res.cookies.delete(FLAG_COOKIE);
  return res;
}

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "pf_auth"; // httpOnly proof of login
export const FLAG_COOKIE = "pf_edit"; // readable by the page, only switches the UI into edit mode

export function tokenFor(password: string) {
  return createHash("sha256").update(`portfolio-edit:${password}`).digest("hex");
}

export function passwordMatches(input: string) {
  const pw = process.env.EDIT_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(tokenFor(input));
  const b = Buffer.from(tokenFor(pw));
  return timingSafeEqual(a, b);
}

export async function isAuthed() {
  const pw = process.env.EDIT_PASSWORD;
  if (!pw) return false;
  const value = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(tokenFor(pw));
  return a.length === b.length && timingSafeEqual(a, b);
}

import { cookies } from "next/headers";
import { LANG_COOKIE, parseLang, UI, type UiKey } from "./i18n";

export async function getLang() {
  return parseLang((await cookies()).get(LANG_COOKIE)?.value);
}

/** UI word in the visitor's language, for server components and page titles. */
export async function uiServer(k: UiKey) {
  return UI[await getLang()][k];
}

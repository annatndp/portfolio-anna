// Two languages. Content text is written in English in content.site/projects;
// Norwegian versions live in content.no keyed by the same path ("site.tagline").
// Fixed UI words (menu, buttons, form labels) are in the dictionary below.

export type Lang = "en" | "no";
export const LANG_COOKIE = "lang";
export const htmlLang = (l: Lang) => (l === "no" ? "nb" : "en");
export const parseLang = (v?: string | null): Lang => (v === "no" ? "no" : "en");

const en = {
  home: "Home",
  projects: "Projects",
  about: "About",
  contact: "Contact",
  switchTo: "Norsk",
  switchToLabel: "Se siden på norsk",
  role: "Graphic designer",
  hi: "Hi, I'm",
  seeProjects: "See projects",
  aboutLabel: "About",
  workTogether: "Let's work together",
  allProjects: "All projects",
  projectNotFound: "Project not found.",
  notFoundTitle: "Oops.",
  notFoundBody: "This page doesn't exist.",
  info: "Info",
  formName: "Name",
  formEmail: "Email",
  formMessage: "Message",
  formPlaceholder: "Share your thoughts, questions, or project details here.",
  formSend: "Submit",
  formSending: "Sending…",
  formThanks: "Thank you!",
  formThanksBody: "Your message is on its way. I'll get back to you soon.",
  formError: "Something went wrong. Please email me directly at",
};

const no: typeof en = {
  home: "Hjem",
  projects: "Prosjekter",
  about: "Om meg",
  contact: "Kontakt",
  switchTo: "English",
  switchToLabel: "View the site in English",
  role: "Grafisk designer",
  hi: "Hei, jeg er",
  seeProjects: "Se prosjekter",
  aboutLabel: "Om meg",
  workTogether: "La oss jobbe sammen",
  allProjects: "Alle prosjekter",
  projectNotFound: "Fant ikke prosjektet.",
  notFoundTitle: "Oi.",
  notFoundBody: "Denne siden finnes ikke.",
  info: "Info",
  formName: "Navn",
  formEmail: "E-post",
  formMessage: "Melding",
  formPlaceholder: "Fortell litt om prosjektet, spørsmålene eller tankene dine her.",
  formSend: "Send",
  formSending: "Sender…",
  formThanks: "Tusen takk!",
  formThanksBody: "Meldingen din er sendt. Jeg svarer deg så snart jeg kan.",
  formError: "Noe gikk galt. Send meg gjerne en e-post direkte til",
};

export const UI = { en, no };
export type UiKey = keyof typeof en;

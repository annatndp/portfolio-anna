import type { Content, Project } from "./types";

// Starting content. Once you save anything in edit mode (/edit), the saved
// version is used instead and this file is only a fallback.

export const emptyImage = "/placeholders/empty.svg";

export function newProject(slug: string): Project {
  return {
    slug,
    title: "New project",
    description: "Short one-line description of the project.",
    category: "Category",
    campaign: "",
    year: String(new Date().getFullYear()),
    cover: emptyImage,
    gallery: [emptyImage, emptyImage],
    tint: "#f1f1f1",
  };
}

export const defaultContent: Content = {
  site: {
    name: "Anna",
    fullName: "Anna Pham",
    role: "a graphic designer",
    tagline: "crafting visuals that get results.",
    description:
      "Anna Pham is a graphic designer crafting brand identities, visual design and web design.",
    email: "anna.tndp@gmail.com",
    portrait: "/placeholders/portrait.svg",
    contactHeading: "Ready to work together?",
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Dribbble", href: "#" },
    ],
    skills: [
      "Brand identity",
      "Content creation",
      "Visual design",
      "Social media",
      "Packaging",
    ],
    about: {
      heading: "Tell you about",
      highlight: "me!",
      statement:
        "Write 2–3 short sentences about you here: who you are, what you love designing, and where you're based.",
      photo: "/placeholders/portrait.svg",
      folders: [
        { label: "UX/UI", image: "/about/ux-ui-dashboard.jpg" },
        { label: "claude_code", image: "/about/claude-code.svg" },
        { label: "b2b_design", image: emptyImage },
      ],
      tools: [
        { short: "Ps", name: "Adobe Photoshop" },
        { short: "Ai", name: "Adobe Illustrator" },
        { short: "Id", name: "Adobe InDesign" },
        { short: "Fg", name: "Figma" },
        { short: "Fc", name: "Final Cut Pro" },
        { short: "Cv", name: "Canva" },
        { short: "Cc", name: "CapCut" },
      ],
      cards: [
        { title: "Education", body: "School name\nProgram · 20XX – 20XX\n\nSchool name\nProgram · 20XX – 20XX" },
        { title: "Experience", body: "Company — Role\n20XX – now\n\nCompany — Role\n20XX – 20XX" },
        { title: "Languages", body: "Language — level\nLanguage — level\nLanguage — level" },
        { title: "Fun facts", body: "Something people don't know about you, or what you do when you're not designing." },
      ],
      punchline: ["Hiring", "her."],
    },
  },
  projects: [
    {
      slug: "project-1",
      title: "Project 1",
      description: "Short one-line description of the project.",
      category: "Branding",
      campaign: "Campaign name",
      year: "2026",
      cover: "/placeholders/project-1.svg",
      gallery: ["/placeholders/project-2.svg", "/placeholders/project-3.svg"],
      tint: "#bcd8ff",
    },
    {
      slug: "project-2",
      title: "Project 2",
      description: "Short one-line description of the project.",
      category: "Packaging",
      campaign: "",
      year: "2026",
      cover: "/placeholders/project-2.svg",
      gallery: ["/placeholders/project-3.svg", "/placeholders/project-5.svg"],
      tint: "#ffebfc",
    },
    {
      slug: "project-3",
      title: "Project 3",
      description: "Short one-line description of the project.",
      category: "Social media",
      campaign: "",
      year: "2025",
      cover: "/placeholders/project-3.svg",
      gallery: ["/placeholders/project-1.svg", "/placeholders/project-4.svg"],
      tint: "#c8f5d0",
    },
    {
      slug: "project-4",
      title: "Project 4",
      description: "Short one-line description of the project.",
      category: "Web design",
      campaign: "",
      year: "2025",
      cover: "/placeholders/project-4.svg",
      gallery: ["/placeholders/project-5.svg", "/placeholders/project-2.svg"],
      tint: "#eaff6b",
    },
  ],
  // Norwegian starting texts. Anything missing here shows the English text.
  no: {
    "site.role": "en grafisk designer",
    "site.tagline": "som skaper design som gir resultater.",
    "site.description": "Anna Pham er en grafisk designer som jobber med merkevareidentitet, visuell design og innhold.",
    "site.contactHeading": "Klar for å jobbe sammen?",
    "site.skills.0": "Merkevareidentitet",
    "site.skills.1": "Innholdsproduksjon",
    "site.skills.2": "Visuell design",
    "site.skills.3": "Sosiale medier",
    "site.skills.4": "Emballasje",
    "site.about.heading": "Litt om",
    "site.about.highlight": "meg!",
    "site.about.statement":
      "Skriv 2–3 korte setninger om deg selv her: hvem du er, hva du elsker å designe, og hvor du bor.",
    "site.about.cards.0.title": "Utdanning",
    "site.about.cards.0.body": "Skolenavn\nStudium · 20XX – 20XX\n\nSkolenavn\nStudium · 20XX – 20XX",
    "site.about.cards.1.title": "Erfaring",
    "site.about.cards.1.body": "Bedrift — Stilling\n20XX – nå\n\nBedrift — Stilling\n20XX – 20XX",
    "site.about.cards.2.title": "Språk",
    "site.about.cards.2.body": "Språk — nivå\nSpråk — nivå\nSpråk — nivå",
    "site.about.cards.3.title": "Morsomme fakta",
    "site.about.cards.3.body": "Noe folk ikke vet om deg, eller hva du gjør når du ikke designer.",
    "site.about.punchline.0": "Ansett",
    "site.about.punchline.1": "henne.",
    "projects.0.title": "Prosjekt 1",
    "projects.0.description": "Kort beskrivelse av prosjektet på én linje.",
    "projects.0.category": "Merkevare",
    "projects.1.title": "Prosjekt 2",
    "projects.1.description": "Kort beskrivelse av prosjektet på én linje.",
    "projects.1.category": "Emballasje",
    "projects.2.title": "Prosjekt 3",
    "projects.2.description": "Kort beskrivelse av prosjektet på én linje.",
    "projects.2.category": "Sosiale medier",
    "projects.3.title": "Prosjekt 4",
    "projects.3.description": "Kort beskrivelse av prosjektet på én linje.",
    "projects.3.category": "Webdesign",
    "projects.0.campaign": "Kampanjenavn",
  },
};

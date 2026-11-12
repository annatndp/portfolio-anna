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
    services: [
      { title: "Brand identity", body: "Logo, colors, and type that make you recognizable." },
      {
        title: "Visual design",
        body: "Campaigns, packaging, social and print — one consistent look across every touchpoint.",
      },
      {
        title: "Web design",
        body: "Clean, fast websites that carry your brand and turn visitors into clients.",
      },
    ],
    about: {
      statement:
        "Anna Pham is a graphic designer who turns briefs into work that lands. Every project is built with intention: clear concept, sharp execution, nothing wasted. This portfolio exists for one reason.",
      punchline: ["Hiring", "her."],
      images: [
        "/placeholders/project-1.svg",
        "/placeholders/project-2.svg",
        "/placeholders/project-3.svg",
        "/placeholders/project-4.svg",
        "/placeholders/project-5.svg",
        "/placeholders/portrait.svg",
      ],
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
};

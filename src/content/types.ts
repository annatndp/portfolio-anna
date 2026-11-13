export type Social = { label: string; href: string };

export type Project = {
  slug: string;
  title: string;
  /** One or two sentences, shown under the title and on the project card. */
  description: string;
  /** Small uppercase line above the title: "Category · Campaign · Year". */
  category: string;
  campaign: string;
  year: string;
  /** Big image at the top of the project page; also the card cover. */
  cover: string;
  /** Images shown two per row under the big image. */
  gallery: string[];
  /** Background color behind the images. */
  tint: string;
};

export type Content = {
  site: {
    name: string;
    fullName: string;
    role: string;
    tagline: string;
    description: string;
    email: string;
    portrait: string;
    contactHeading: string;
    socials: Social[];
    /** Labels on the floating cursors in the hero. */
    skills: string[];
    about: {
      /** "Tell you about" + the framed word "me!" */
      heading: string;
      highlight: string;
      statement: string;
      /** Main photo in the Figma-style selection frame. */
      photo: string;
      /** Small folders floating around the photo; hovering one shows its image. */
      folders: { label: string; image: string }[];
      /** App icons in the dock under the photo: short = text on the icon, name = tooltip. */
      tools: { short: string; name: string }[];
      /** Cards that fan out of the big folder on the second screen. */
      cards: { title: string; body: string }[];
      punchline: [string, string];
    };
  };
  projects: Project[];
  /** Norwegian texts, keyed by the path of the English text ("site.tagline", "projects.0.title"). */
  no: Record<string, string>;
};

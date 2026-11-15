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
  /** Frame size of the big image (drag handle in edit mode). */
  coverFrame?: FrameSize;
  /** Frame size per gallery image, same order as `gallery`. */
  galleryFrames?: (FrameSize | null)[];
  /** Space between images in px: gapX between images in a row, gapY between rows (sliders in edit mode). */
  gapX?: number;
  gapY?: number;
  /** Text size / weight / color for "meta", "title", "description". */
  looks?: Record<string, TextLook>;
};

/** w = width in % of the row (20–100), r = height ÷ width, m = same height as the image beside it (r only on phones), c = corner radius in px. */
export type FrameSize = { w?: number; r?: number; m?: boolean; c?: number };
/** s = size multiplier, w = font weight, c = "ink" | "gray" | "accent" | hex color. */
export type TextLook = { s?: number; w?: number; c?: string };

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
      cards: {
        title: string;
        body: string;
        bodyStyle?: { lh?: number; ls?: number; gap?: number };
        wide?: boolean; // spans both columns
        scale?: number; // text size, 1 = normal
      }[];
      /** Max width of the 2 × 2 card grid in px (drag handle in edit mode). */
      cardsWidth: number;
      punchline: [string, string];
    };
  };
  projects: Project[];
  /** Norwegian texts, keyed by the path of the English text ("site.tagline", "projects.0.title"). */
  no: Record<string, string>;
};

export type Service = { title: string; body: string };
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
    services: Service[];
    about: {
      statement: string;
      punchline: [string, string];
      images: string[];
    };
  };
  projects: Project[];
};

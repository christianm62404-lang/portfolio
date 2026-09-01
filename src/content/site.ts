/** Identity, contact points, and navigation. Edit here to update the whole site. */

export const site = {
  name: "Christian Artigas",
  shortName: "Artigas",
  initials: "CA",
  role: "Computer Engineering B.S. — University of Central Florida",
  graduation: "Expected May 2027",
  location: "Orlando, FL",
  /**
   * Set this once the site has a real domain. It is used for canonical URLs,
   * the sitemap, and Open Graph tags.
   */
  url: "https://christianartigas.dev",
  description:
    "Christian Artigas is a Computer Engineering student at UCF working across embedded systems, electronics, full-stack software, and machine learning.",
  email: "christianm62404@gmail.com",
  phone: "(321) 201-2313",
  resumePath: "/resume.pdf",
  /**
   * Headshot basename, without an extension, resolved against public/.
   * findPortrait() tries .jpg, .jpeg, .png, .webp, and .avif in that order, so
   * replacing the photo only means matching this name. Until a matching file
   * exists the hero renders a monogram plate instead.
   */
  portraitName: "headshot_full",
  socials: [
    { label: "GitHub", handle: "christianm62404-lang", href: "https://github.com/christianm62404-lang" },
    {
      label: "LinkedIn",
      handle: "christian-artigas",
      href: "https://www.linkedin.com/in/christian-artigas-5032b6276",
    },
  ],
} as const;

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
] as const;

export type NavId = (typeof navItems)[number]["id"];

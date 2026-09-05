/** Identity, contact points, and navigation. Edit here to update the whole site. */

export const site = {
  name: "Christian Artigas",
  shortName: "Artigas",
  initials: "CA",
  role: "Computer Engineering B.S. — University of Central Florida",
  graduation: "Expected May 2027",
  location: "Orlando, FL",
  /**
   * The canonical origin. Used for canonical URLs, the sitemap, and Open Graph
   * tags, so it must match the domain the site is actually served from — no
   * trailing slash, and https, which a .dev domain requires anyway.
   */
  url: "https://chrisartigas.dev",
  description:
    "Christian Artigas is a Computer Engineering student at UCF working across embedded systems, electronics, full-stack software, and machine learning.",
  email: "christianm62404@gmail.com",
  resumePath: "/resume.pdf",
  /**
   * Headshot basename, without an extension, resolved against public/.
   * findPortrait() tries .jpg, .jpeg, .png, .webp, and .avif in that order, so
   * replacing the photo only means matching this name. Until a matching file
   * exists the hero renders a monogram plate instead.
   */
  portraitName: "headshot_full",
  /**
   * Photographs the hidden mode shows in place of the headshot, by basename
   * against public/. Listed rather than discovered so adding a stray image to
   * public/ cannot silently join the set; any that are missing are skipped,
   * and with none present the hero simply keeps the headshot.
   */
  hiddenPortraitNames: ["IMG_0454", "IMG_1937", "IMG_2024"],
  /**
   * The personal accounts, shown only in the hidden mode. Kept apart from
   * `socials` deliberately: those two are the professional links the ordinary
   * site leads with, and these are not.
   */
  personalSocials: [
    {
      label: "Spotify",
      handle: "Christian Artigas",
      href: "https://open.spotify.com/user/10by4zsblbudom5lvd95zqhmo?si=b7db57b138e74133",
    },
    {
      label: "Instagram",
      handle: "@christian_artigas",
      href: "https://www.instagram.com/christian_artigas",
    },
  ],
  socials: [
    {
      label: "GitHub",
      handle: "christianm62404-lang",
      href: "https://github.com/christianm62404-lang",
    },
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
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

/** The shorter run the hidden mode shows, in the order the panels are laid. */
export const hiddenNavItems = [
  { id: "home", label: "Home" },
  { id: "experience", label: "Experience" },
  { id: "personal", label: "Elsewhere" },
  { id: "contact", label: "Contact" },
] as const;

export type NavId =
  | (typeof navItems)[number]["id"]
  | (typeof hiddenNavItems)[number]["id"];

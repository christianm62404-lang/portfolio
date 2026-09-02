import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-tech",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Computer Engineering`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "Christian Artigas",
    "computer engineering",
    "embedded systems",
    "full-stack developer",
    "MSP430",
    "React",
    "Next.js",
    "TypeScript",
    "machine learning",
    "UCF",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Computer Engineering, UCF`,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Computer Engineering, UCF`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport: Viewport = {
  // Matches the two page grounds, so browser chrome tracks the active theme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

/** Structured data so search results describe a person, not a page. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Computer Engineering Student",
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Central Florida" },
  address: { "@type": "PostalAddress", addressLocality: "Orlando", addressRegion: "FL" },
  sameAs: site.socials.map((social) => social.href),
  knowsAbout: [
    "Embedded systems",
    "Analog electronics",
    "Full-stack web development",
    "Machine learning",
    "Computer architecture",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a stored theme choice before first paint, so a visitor who
            chose light never sees a dark flash. It only sets an attribute on
            <html>, which carries suppressHydrationWarning above. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a
          href="#work"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:border focus:border-signal focus:bg-canvas focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to the work
        </a>

        {children}

        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </body>
    </html>
  );
}

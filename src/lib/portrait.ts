import fs from "node:fs";
import path from "node:path";
import { site } from "@/content/site";

/** Formats accepted for the headshot, in the order they are preferred. */
const PORTRAIT_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

/**
 * Finds the headshot, if it has been added. Server-only.
 *
 * The photo is supplied by the site owner rather than committed by the build,
 * so its presence is resolved here instead of being discovered by the browser
 * as a failed request. Any of the usual formats works — whichever the photo
 * happens to be saved as is the one that gets used.
 *
 * Returns the public path, or null so the caller can render a fallback.
 */
export function findPortrait(): string | null {
  for (const extension of PORTRAIT_EXTENSIONS) {
    const file = `${site.portraitName}.${extension}`;
    try {
      if (fs.existsSync(path.join(process.cwd(), "public", file))) return `/${file}`;
    } catch {
      // An unreadable public directory is not worth failing the build over.
      return null;
    }
  }
  return null;
}

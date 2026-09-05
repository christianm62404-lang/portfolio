import fs from "node:fs";
import path from "node:path";
import {
  SPRITE_FILES,
  type SpriteManifest,
  type SpriteRole,
} from "@/lib/sprite";

/**
 * Which frames actually exist, resolved on the server.
 *
 * The art is supplied by the site owner rather than committed by the build, so
 * its presence is checked here instead of being discovered by the browser as a
 * string of failed requests. Frames that are missing are simply absent from
 * the manifest, and the character component decides what to do without them —
 * a left-facing frame can be mirrored from its right-facing twin, and with no
 * frames at all the character does not render.
 */
export function readSpriteManifest(): SpriteManifest {
  const manifest: SpriteManifest = {};
  for (const [role, file] of Object.entries(SPRITE_FILES) as [
    SpriteRole,
    string,
  ][]) {
    try {
      if (fs.existsSync(path.join(process.cwd(), "public", "sprite", file))) {
        manifest[role] = `/sprite/${file}`;
      }
    } catch {
      // An unreadable public directory is not worth failing the build over.
      return {};
    }
  }
  return manifest;
}

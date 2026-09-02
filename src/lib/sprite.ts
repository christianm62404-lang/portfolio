import fs from "node:fs";
import path from "node:path";

/**
 * The character's frames.
 *
 * Keys are the roles the animation needs; values are the files expected in
 * public/sprite/. Naming follows "<facing>-<leading leg>", so `right-left` is
 * facing right with the left leg forward.
 */
export const SPRITE_FILES = {
  forward: "face-forward.png",
  faceLeft: "face-left.png",
  faceRight: "face-right.png",
  leftLeft: "left-left.png",
  leftRight: "left-right.png",
  rightLeft: "right-left.png",
  rightRight: "right-right.png",
} as const;

export type SpriteRole = keyof typeof SPRITE_FILES;
export type SpriteManifest = Partial<Record<SpriteRole, string>>;

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
  for (const [role, file] of Object.entries(SPRITE_FILES) as [SpriteRole, string][]) {
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

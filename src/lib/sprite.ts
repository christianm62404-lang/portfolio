/**
 * The character's frames, as data only.
 *
 * No filesystem here: this module is imported by the client component that
 * animates him, and pulling `node:fs` in behind a single constant is enough to
 * break the client bundle. Resolving which files exist lives in
 * `sprite-server.ts` instead.
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
  /* Resting frames for the hidden mode. `smolder` stands in for `forward`, and
     `smolderEyebrow` is the one it flicks to. */
  smolder: "smolder.png",
  smolderEyebrow: "smolder-eyebrow.png",

  /* And its walk: a second, longer cycle drawn for the mode. The suffixes are
     the art's own — `ss` is the wider stride, `s` the narrower one. */
  faceLeftS: "face-left-s.png",
  faceRightS: "face-right-s.png",
  leftLeftS: "left-left-s.png",
  leftLeftSS: "left-left-ss.png",
  leftRightS: "left-right-s.png",
  leftRightSS: "left-right-ss.png",
  rightLeftS: "right-left-s.png",
  rightLeftSS: "right-left-ss.png",
  rightRightS: "right-right-s.png",
  rightRightSS: "right-right-ss.png",
} as const;

/**
 * The roles only the hidden mode uses.
 *
 * Held apart so the ordinary site does not carry the mode's art: the character
 * renders one set or the other, and a visitor who never finds the mode never
 * loads a frame of it.
 */
export const HIDDEN_ROLES = [
  "smolder",
  "smolderEyebrow",
  "faceLeftS",
  "faceRightS",
  "leftLeftS",
  "leftLeftSS",
  "leftRightS",
  "leftRightSS",
  "rightLeftS",
  "rightLeftSS",
  "rightRightS",
  "rightRightSS",
] as const;

export type SpriteRole = keyof typeof SPRITE_FILES;
export type SpriteManifest = Partial<Record<SpriteRole, string>>;

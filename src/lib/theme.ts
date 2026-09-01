/**
 * Theme preference, shared by the toggle and the pre-paint script in the
 * document head. Keeping the key and the cycle in one place means the
 * inline script and the React component can never disagree about them.
 */

export const THEME_STORAGE_KEY = "theme";

export type ThemeChoice = "light" | "dark";
/** `null` means "follow the operating system" — the default. */
export type ThemePreference = ThemeChoice | null;

export const THEME_CYCLE: ThemePreference[] = [null, "light", "dark"];

export function nextTheme(current: ThemePreference): ThemePreference {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

/**
 * Applies a preference to the document.
 *
 * Setting `data-theme` pins `color-scheme` in CSS, which is what every
 * `light-dark()` token resolves against — so this one attribute repaints the
 * entire palette. Removing it hands the decision back to the OS.
 *
 * The cross-fade needs nothing here. The palette tokens are registered as
 * typed colours in globals.css and carry their own transition, so changing
 * this attribute interpolates them rather than swapping them — including when
 * the change comes from the operating system rather than the toggle.
 */
export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference) root.dataset.theme = preference;
  else delete root.dataset.theme;
}

/**
 * The preference currently in effect, read from the attribute the pre-paint
 * script and the toggle both write.
 *
 * This — not localStorage — is the source of truth: it stays correct when
 * storage is unavailable, so the cycle keeps advancing in a private window
 * even though the choice will not survive the page.
 */
export function readAppliedTheme(): ThemePreference {
  const value = document.documentElement.dataset.theme;
  return value === "light" || value === "dark" ? value : null;
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    // Storage can be unavailable in private modes; following the OS is a fine
    // fallback, so this is not worth surfacing.
    return null;
  }
}

export function storeTheme(preference: ThemePreference) {
  try {
    if (preference) localStorage.setItem(THEME_STORAGE_KEY, preference);
    else localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // The theme still applies for this page view; it just will not persist.
  }
}

/**
 * Runs before first paint, inlined in <head>. Written as a compact string
 * because it is injected verbatim and must not depend on the bundle having
 * loaded — otherwise a visitor who chose light would see a dark flash.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

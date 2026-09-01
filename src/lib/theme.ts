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

const WIPE_ATTRIBUTE = "data-theme-wipe";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

/**
 * Applies a preference to the document.
 *
 * Setting `data-theme` pins `color-scheme` in CSS, which is what every
 * `light-dark()` token resolves against — so this one attribute repaints the
 * entire palette. Removing it hands the decision back to the OS.
 *
 * How that repaint is animated depends on what the browser can do:
 *
 * - With the View Transitions API, the new palette is wiped in diagonally
 *   from the top-right corner. The animation itself lives in globals.css; all
 *   that is needed here is to run the change inside a transition and to
 *   suppress the token fade while it does, so the region being revealed is not
 *   also cross-fading and blurring the edge away.
 * - Without it, the registered colour tokens carry their own transition and
 *   cross-fade the palette uniformly instead.
 * - Under reduced motion, neither runs and the switch is immediate.
 */
export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;

  const commit = () => {
    if (preference) root.dataset.theme = preference;
    else delete root.dataset.theme;
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const startViewTransition = (document as ViewTransitionDocument).startViewTransition;

  if (reduceMotion || typeof startViewTransition !== "function") {
    commit();
    return;
  }

  root.setAttribute(WIPE_ATTRIBUTE, "");
  // A transition can be skipped — by a second click, or by the tab being
  // hidden. `finished` settles either way, and the theme is already applied,
  // so clearing the attribute is all the cleanup there is.
  startViewTransition
    .call(document, commit)
    .finished.catch(() => {})
    .finally(() => root.removeAttribute(WIPE_ATTRIBUTE));
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

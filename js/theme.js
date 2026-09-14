export const THEME_KEY = "taskQuest.theme";
export const THEMES = Object.freeze({ LIGHT: "light", DARK: "dark" });

/** @param {unknown} value @returns {"light" | "dark" | null} */
export function normalizeTheme(value) {
  return value === THEMES.LIGHT || value === THEMES.DARK ? value : null;
}

/** @param {{matches: boolean} | null | undefined} preference */
export function getSystemTheme(preference) {
  return preference?.matches ? THEMES.DARK : THEMES.LIGHT;
}

/**
 * @param {Document} documentRef
 * @param {Storage | null | undefined} storage
 * @param {{matches: boolean} | null | undefined} systemPreference
 */
export function createThemeController(documentRef, storage, systemPreference) {
  let theme = readTheme(storage) ?? getSystemTheme(systemPreference);
  applyTheme(documentRef, theme);
  return {
    getTheme() { return theme; },
    toggle() {
      theme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      applyTheme(documentRef, theme);
      return { theme, persisted: writeTheme(storage, theme) };
    },
  };
}

/** @param {Document} documentRef @param {"light" | "dark"} theme */
function applyTheme(documentRef, theme) {
  documentRef.documentElement.dataset.theme = theme;
  documentRef.documentElement.style.colorScheme = theme;
  const button = documentRef.getElementById("theme-toggle");
  if (button) {
    const nextTheme = theme === THEMES.DARK ? "claro" : "escuro";
    button.setAttribute("aria-label", `Ativar modo ${nextTheme}`);
    button.setAttribute("aria-pressed", String(theme === THEMES.DARK));
    const label = button.querySelector("[data-theme-label]");
    if (label) {
      label.textContent = theme === THEMES.DARK ? "Modo escuro" : "Modo claro";
    }
  }
}

/** @param {Storage | null | undefined} storage */
function readTheme(storage) {
  try { return normalizeTheme(storage?.getItem(THEME_KEY)); } catch { return null; }
}

/** @param {Storage | null | undefined} storage @param {"light" | "dark"} theme */
function writeTheme(storage, theme) {
  try {
    storage?.setItem(THEME_KEY, theme);
    return Boolean(storage);
  } catch {
    return false;
  }
}

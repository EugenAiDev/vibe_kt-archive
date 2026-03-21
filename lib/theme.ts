export type ThemeMode = "system" | "light" | "dark"
export type AppliedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "kt-archive-theme-mode"

export function getAppliedTheme(mode: ThemeMode, prefersDark: boolean): AppliedTheme {
  if (mode === "system") {
    return prefersDark ? "dark" : "light"
  }

  return mode
}

export function getNextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === "system") return "light"
  if (mode === "light") return "dark"
  return "system"
}

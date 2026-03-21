"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  getAppliedTheme,
  THEME_STORAGE_KEY,
  type AppliedTheme,
  type ThemeMode,
} from "@/lib/theme"

type ThemeContextValue = {
  mode: ThemeMode
  appliedTheme: AppliedTheme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system"

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system"
}

function getInitialPrefersDark() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)
  const [prefersDark, setPrefersDark] = useState(getInitialPrefersDark)
  const appliedTheme = getAppliedTheme(mode, prefersDark)

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)

    media.addEventListener("change", onChange)

    return () => media.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", appliedTheme === "dark")
    root.style.colorScheme = appliedTheme
  }, [appliedTheme])

  const value = useMemo(
    () => ({
      mode,
      appliedTheme,
      setMode,
    }),
    [appliedTheme, mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

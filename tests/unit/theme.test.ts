import { describe, expect, it } from "vitest"
import { getAppliedTheme, getNextThemeMode } from "@/lib/theme"

describe("theme helpers", () => {
  it("uses system preference when mode is system", () => {
    expect(getAppliedTheme("system", true)).toBe("dark")
    expect(getAppliedTheme("system", false)).toBe("light")
  })

  it("returns explicit theme when user overrides system", () => {
    expect(getAppliedTheme("dark", false)).toBe("dark")
    expect(getAppliedTheme("light", true)).toBe("light")
  })

  it("cycles through theme modes in a predictable order", () => {
    expect(getNextThemeMode("system")).toBe("light")
    expect(getNextThemeMode("light")).toBe("dark")
    expect(getNextThemeMode("dark")).toBe("system")
  })
})

import { describe, expect, it } from "vitest"
import { evaluateAccess } from "@/lib/access"

describe("evaluateAccess", () => {
  it("redirects to /login when no session", () => {
    const result = evaluateAccess({ pathname: "/dashboard", role: null })
    expect(result.action).toBe("redirect")
    expect(result.to).toBe("/login")
  })

  it("blocks non-admin from /admin", () => {
    const result = evaluateAccess({ pathname: "/admin", role: "USER" })
    expect(result.action).toBe("redirect")
    expect(result.to).toBe("/dashboard")
  })

  it("blocks guest from edit routes", () => {
    const result = evaluateAccess({ pathname: "/protocols/123/edit", role: "GUEST" })
    expect(result.action).toBe("redirect")
    expect(result.to).toBe("/dashboard")
  })

  it("allows user to dashboard", () => {
    const result = evaluateAccess({ pathname: "/dashboard", role: "USER" })
    expect(result.action).toBe("allow")
  })

  it("allows auth api routes without session", () => {
    const result = evaluateAccess({ pathname: "/api/auth/session", role: null })
    expect(result.action).toBe("allow")
  })
})

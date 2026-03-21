export type Role = "ADMIN" | "USER" | "GUEST"

export type AccessDecision =
  | { action: "allow" }
  | { action: "redirect"; to: "/login" | "/dashboard" }

export function evaluateAccess(params: {
  pathname: string
  role: Role | null
}): AccessDecision {
  const { pathname, role } = params

  if (pathname.startsWith("/api/auth")) return { action: "allow" }
  if (pathname.startsWith("/login")) return { action: "allow" }
  if (!role) return { action: "redirect", to: "/login" }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return { action: "redirect", to: "/dashboard" }
  }

  const isEditRoute = pathname.includes("/edit") || pathname.includes("/new")

  if (role === "GUEST" && isEditRoute) {
    return { action: "redirect", to: "/dashboard" }
  }

  return { action: "allow" }
}

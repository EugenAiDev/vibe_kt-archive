import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-token"

export type AuthRole = "ADMIN" | "USER" | "GUEST"

export async function requireAuth(req: NextRequest) {
  const token = await getAuthToken(req)
  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 }),
    }
  }

  return {
    ok: true as const,
    token,
  }
}

export async function requireAdmin(req: NextRequest) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth

  if (auth.token.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 }),
    }
  }

  return auth
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { evaluateAccess } from "@/lib/access"
import { getAuthToken } from "@/lib/auth-token"

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getAuthToken(req)
  const role = (token?.role as "ADMIN" | "USER" | "GUEST" | undefined) ?? null

  const decision = evaluateAccess({ pathname, role })
  if (decision.action === "allow") {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL(decision.to, req.url))
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/section/:path*", "/pathologies/:path*", "/protocols/:path*", "/todos/:path*", "/search/:path*", "/admin/:path*"],
}

import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { canDeleteCategory } from "@/lib/api"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

export const DELETE = async (req: NextRequest, ctx: RouteContext) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const { id } = await Promise.resolve(ctx.params)
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  if (!canDeleteCategory({ isLocked: category.isLocked })) {
    return NextResponse.json(
      { error: "Locked category", code: "LOCKED_CATEGORY" },
      { status: 400 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

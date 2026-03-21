import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

export const GET = async (_req: NextRequest, ctx: RouteContext) => {
  const { id } = await Promise.resolve(ctx.params)
  const item = await prisma.pathology.findUnique({
    where: { id },
    include: { protocols: true },
  })
  return NextResponse.json(item)
}

export const PUT = async (req: NextRequest, ctx: RouteContext) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const { id } = await Promise.resolve(ctx.params)
  const body = await req.json()
  const updated = await prisma.pathology.update({
    where: { id },
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      contentJson: body.contentJson ?? null,
      contentText: body.contentText ?? "",
      textColor: body.textColor ?? null,
      emoji: body.emoji ?? null,
      categoryId: body.categoryId,
    },
  })
  return NextResponse.json(updated)
}

export const DELETE = async (req: NextRequest, ctx: RouteContext) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  const { id } = await Promise.resolve(ctx.params)
  await prisma.pathology.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

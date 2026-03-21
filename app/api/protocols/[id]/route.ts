import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

export const GET = async (_req: NextRequest, ctx: RouteContext) => {
  const { id } = await Promise.resolve(ctx.params)
  const item = await prisma.protocol.findUnique({
    where: { id },
    include: {
      pathology: {
        select: {
          id: true,
          title: true,
        },
      },
    },
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
  const title = body.title as string | undefined
  const pathologyId = body.pathologyId as string | undefined
  if (!title?.trim() || !pathologyId) {
    return NextResponse.json({ error: "Invalid payload", code: "BAD_REQUEST" }, { status: 400 })
  }

  const pathology = await prisma.pathology.findUnique({
    where: { id: pathologyId },
    select: { id: true },
  })
  if (!pathology) {
    return NextResponse.json({ error: "Pathology not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const updated = await prisma.protocol.update({
    where: { id },
    data: {
      title: title.trim(),
      contentJson: body.contentJson ?? null,
      contentText: body.contentText ?? "",
      pathologyId,
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
  await prisma.protocol.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { resolveCurrentUserId } from "@/lib/current-user"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

export const PUT = async (req: NextRequest, ctx: RouteContext) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const { id } = await Promise.resolve(ctx.params)
  const body = await req.json()
  const text = body.text as string | undefined
  const isDone = body.isDone as boolean | undefined
  const dueAt = body.dueAt ? new Date(body.dueAt as string) : null

  const existing = await prisma.todo.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const userId = await resolveCurrentUserId(token)
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired, please sign in again", code: "SESSION_EXPIRED" },
      { status: 401 },
    )
  }
  if (token.role !== "ADMIN" && existing.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const updated = await prisma.todo.update({
    where: { id },
    data: {
      ...(text !== undefined ? { text } : {}),
      ...(isDone !== undefined ? { isDone } : {}),
      dueAt,
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
  const existing = await prisma.todo.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const userId = await resolveCurrentUserId(token)
  if (!userId) {
    return NextResponse.json(
      { error: "Session expired, please sign in again", code: "SESSION_EXPIRED" },
      { status: 401 },
    )
  }
  if (token.role !== "ADMIN" && existing.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  await prisma.todo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { ensureReplyAllowed } from "@/lib/comments"
import { resolveCurrentUserId } from "@/lib/current-user"

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pathologyId = searchParams.get("pathologyId")
  if (!pathologyId) {
    return NextResponse.json({ error: "Missing pathologyId", code: "BAD_REQUEST" }, { status: 400 })
  }

  const items = await prisma.comment.findMany({
    where: { pathologyId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  return NextResponse.json(items)
}

export const POST = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const authorId = await resolveCurrentUserId(token)
  if (!authorId) {
    return NextResponse.json(
      { error: "Session expired, please sign in again", code: "SESSION_EXPIRED" },
      { status: 401 },
    )
  }

  const body = await req.json()
  const pathologyId = body.pathologyId as string | undefined
  const text = body.text as string | undefined
  const parentId = body.parentId as string | undefined

  if (!pathologyId || !text?.trim()) {
    return NextResponse.json({ error: "Invalid payload", code: "BAD_REQUEST" }, { status: 400 })
  }

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } })
    if (!parent) {
      return NextResponse.json({ error: "Parent not found", code: "NOT_FOUND" }, { status: 404 })
    }
    if (parent.pathologyId !== pathologyId) {
      return NextResponse.json({ error: "Parent mismatch", code: "BAD_REQUEST" }, { status: 400 })
    }
    try {
      ensureReplyAllowed({ parentId: parent.parentId })
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message, code: "REPLY_DEPTH" },
        { status: 400 }
      )
    }
  }

  const created = await prisma.comment.create({
    data: {
      text,
      pathologyId,
      parentId: parentId ?? null,
      authorId,
    },
  })

  return NextResponse.json(created)
}

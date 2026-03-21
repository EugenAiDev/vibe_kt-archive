import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { resolveCurrentUserId } from "@/lib/current-user"

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pathologyId = searchParams.get("pathologyId")
  const protocolId = searchParams.get("protocolId")
  const isAll = searchParams.get("all") === "1"

  if (isAll) {
    const items = await prisma.todo.findMany({
      include: {
        pathology: {
          select: {
            id: true,
            title: true,
          },
        },
        protocol: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ isDone: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(items)
  }

  if (!pathologyId && !protocolId) {
    return NextResponse.json({ error: "Missing scope", code: "BAD_REQUEST" }, { status: 400 })
  }

  const items = await prisma.todo.findMany({
    where: {
      ...(pathologyId ? { pathologyId } : {}),
      ...(protocolId ? { protocolId } : {}),
    },
    orderBy: { createdAt: "asc" },
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
  const text = body.text as string | undefined
  const pathologyId = body.pathologyId as string | undefined
  const protocolId = body.protocolId as string | undefined
  const dueAt = body.dueAt ? new Date(body.dueAt as string) : null

  if (!text?.trim() || !pathologyId) {
    return NextResponse.json({ error: "Invalid payload", code: "BAD_REQUEST" }, { status: 400 })
  }

  const created = await prisma.todo.create({
    data: {
      text,
      pathologyId,
      protocolId: protocolId ?? null,
      dueAt,
      authorId,
    },
  })

  return NextResponse.json(created)
}

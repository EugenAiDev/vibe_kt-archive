import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pathologyId = searchParams.get("pathologyId")
  const items = await prisma.protocol.findMany({
    where: pathologyId ? { pathologyId } : undefined,
    include: {
      pathology: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(items)
}

export const POST = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

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

  const created = await prisma.protocol.create({
    data: {
      title: title.trim(),
      contentJson: body.contentJson ?? null,
      contentText: body.contentText ?? "",
      pathologyId,
    },
  })
  return NextResponse.json(created)
}

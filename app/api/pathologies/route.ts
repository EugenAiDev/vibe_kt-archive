import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get("categoryId")
  const items = await prisma.pathology.findMany({
    where: categoryId ? { categoryId } : undefined,
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
  const created = await prisma.pathology.create({
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
  return NextResponse.json(created)
}

import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { buildCategoryTree } from "@/lib/api"

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json(buildCategoryTree(categories))
}

export const POST = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const body = await req.json()
  const created = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      parentId: body.parentId ?? null,
      section: body.section,
      isLocked: false,
    },
  })
  return NextResponse.json(created)
}

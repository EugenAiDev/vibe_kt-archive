import { NextResponse, type NextRequest } from "next/server"
import { promises as fs } from "node:fs"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { resolveMediaVariant } from "@/lib/media/file"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

export const GET = async (req: NextRequest, ctx: RouteContext) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const variant = searchParams.get("variant") ?? "original"

  const { id } = await Promise.resolve(ctx.params)
  const item = await prisma.media.findUnique({ where: { id } })
  if (!item) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const { filePath, contentType } = resolveMediaVariant(item, variant)

  if (!filePath) {
    return NextResponse.json({ error: "File not available", code: "NOT_FOUND" }, { status: 404 })
  }

  try {
    const data = await fs.readFile(filePath)
    return new NextResponse(data, {
      headers: { "Content-Type": contentType },
    })
  } catch {
    return NextResponse.json({ error: "File not found", code: "NOT_FOUND" }, { status: 404 })
  }
}

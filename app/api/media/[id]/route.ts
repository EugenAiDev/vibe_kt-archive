import { NextResponse, type NextRequest } from "next/server"
import { promises as fs } from "node:fs"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

async function safeUnlink(filePath: string | null) {
  if (!filePath) return
  try {
    await fs.unlink(filePath)
  } catch {
    // ignore missing files
  }
}

export const DELETE = async (req: NextRequest, ctx: RouteContext) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const { id } = await Promise.resolve(ctx.params)
  const item = await prisma.media.findUnique({ where: { id } })
  if (!item) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  }

  await prisma.media.delete({ where: { id } })
  await Promise.all([
    safeUnlink(item.filename),
    safeUnlink(item.previewSmall),
    safeUnlink(item.previewLarge),
    safeUnlink(item.poster),
  ])

  return NextResponse.json({ ok: true })
}

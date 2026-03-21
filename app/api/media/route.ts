import { NextResponse, type NextRequest } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { extension as mimeExtension } from "mime-types"
import { prisma } from "@/lib/prisma"
import { getAuthToken } from "@/lib/auth-token"
import { detectMediaKind } from "@/lib/media/types"
import { buildMediaPaths, ensureMediaDirs } from "@/lib/media/storage"
import { createImagePreviews, readImageSize } from "@/lib/media/images"
import { createVideoPoster, readVideoDuration } from "@/lib/media/video"

const getUploadsDir = () =>
  process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads")

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pathologyId = searchParams.get("pathologyId")
  const protocolId = searchParams.get("protocolId")
  if (!pathologyId && !protocolId) {
    return NextResponse.json({ error: "Missing scope", code: "BAD_REQUEST" }, { status: 400 })
  }

  const items = await prisma.media.findMany({
    where: {
      ...(pathologyId ? { pathologyId } : {}),
      ...(protocolId ? { protocolId } : {}),
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(items)
}

export const POST = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })
  if (token.role === "GUEST") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const form = await req.formData()
  const file = form.get("file")
  const pathologyId = form.get("pathologyId")?.toString() ?? null
  const protocolId = form.get("protocolId")?.toString() ?? null

  if (!pathologyId && !protocolId) {
    return NextResponse.json({ error: "Missing scope", code: "BAD_REQUEST" }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file", code: "BAD_REQUEST" }, { status: 400 })
  }

  const mimeType = file.type || "application/octet-stream"
  let kind: "image" | "video"
  try {
    kind = detectMediaKind(mimeType)
  } catch {
    return NextResponse.json({ error: "Unsupported type", code: "UNSUPPORTED" }, { status: 400 })
  }

  const ext =
    mimeExtension(mimeType)?.toString() ||
    path.extname(file.name).replace(".", "") ||
    "bin"

  const id = randomUUID()
  const baseDir = getUploadsDir()
  await ensureMediaDirs(baseDir)
  const paths = buildMediaPaths({ baseDir, id, ext, kind })

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(paths.original, buffer)

  let width: number | null = null
  let height: number | null = null
  let durationSec: number | null = null
  let previewSmall: string | null = null
  let previewLarge: string | null = null
  let poster: string | null = null

  if (kind === "image") {
    await createImagePreviews(paths.original, paths.previewSmall, paths.previewLarge)
    const size = await readImageSize(paths.original)
    width = size.width
    height = size.height
    previewSmall = paths.previewSmall
    previewLarge = paths.previewLarge
  } else {
    await createVideoPoster(paths.original, paths.poster)
    durationSec = await readVideoDuration(paths.original)
    poster = paths.poster
  }

  const created = await prisma.media.create({
    data: {
      id,
      pathologyId,
      protocolId,
      type: kind === "image" ? "IMAGE" : "VIDEO",
      mimeType,
      originalName: file.name,
      filename: paths.original,
      size: file.size,
      width,
      height,
      durationSec,
      previewSmall,
      previewLarge,
      poster,
    },
  })

  return NextResponse.json(created)
}

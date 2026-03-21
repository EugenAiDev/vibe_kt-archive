import { randomUUID } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { POST as uploadMedia } from "@/app/api/media/route"
import { DELETE as deleteMedia } from "@/app/api/media/[id]/route"

vi.mock("@/lib/auth-token", () => ({
  getAuthToken: async () => ({ role: "ADMIN", sub: "test-user" }),
}))

describe("media integration", () => {
  it("uploads image and deletes it via API", async () => {
    const previousUploadsDir = process.env.UPLOADS_DIR
    const uploadsDir = path.join(process.cwd(), "uploads-test", randomUUID())
    process.env.UPLOADS_DIR = uploadsDir

    const slug = `media-${randomUUID().slice(0, 8)}`
    const category = await prisma.category.create({
      data: { name: `Media ${slug}`, slug, section: "CT" },
    })
    const pathology = await prisma.pathology.create({
      data: {
        title: "Media case",
        contentText: "Sample",
        contentJson: null,
        categoryId: category.id,
      },
    })

    let mediaId: string | null = null
    let originalPath: string | null = null
    let previewSmallPath: string | null = null
    let previewLargePath: string | null = null

    try {
      const png = await sharp({
        create: {
          width: 4,
          height: 4,
          channels: 3,
          background: { r: 200, g: 100, b: 50 },
        },
      })
        .png()
        .toBuffer()

      const form = new FormData()
      form.set("file", new File([png], "tiny.png", { type: "image/png" }))
      form.set("pathologyId", pathology.id)

      const uploadReq = new NextRequest("http://localhost/api/media", {
        method: "POST",
        body: form,
      })
      const uploadRes = await uploadMedia(uploadReq)
      expect(uploadRes.status).toBe(200)

      const created = (await uploadRes.json()) as {
        id: string
        filename: string
        previewSmall: string | null
        previewLarge: string | null
      }

      mediaId = created.id
      originalPath = created.filename
      previewSmallPath = created.previewSmall
      previewLargePath = created.previewLarge

      const uploaded = await prisma.media.findUnique({ where: { id: created.id } })
      expect(uploaded?.id).toBe(created.id)
      expect(uploaded?.pathologyId).toBe(pathology.id)

      await expect(fs.stat(created.filename)).resolves.toBeTruthy()
      if (created.previewSmall) {
        await expect(fs.stat(created.previewSmall)).resolves.toBeTruthy()
      }
      if (created.previewLarge) {
        await expect(fs.stat(created.previewLarge)).resolves.toBeTruthy()
      }

      const deleteReq = new NextRequest(`http://localhost/api/media/${created.id}`, {
        method: "DELETE",
      })
      const deleteRes = await deleteMedia(deleteReq, { params: { id: created.id } })
      expect(deleteRes.status).toBe(200)

      const gone = await prisma.media.findUnique({ where: { id: created.id } })
      expect(gone).toBeNull()

      await expect(fs.stat(created.filename)).rejects.toBeDefined()
      if (created.previewSmall) {
        await expect(fs.stat(created.previewSmall)).rejects.toBeDefined()
      }
      if (created.previewLarge) {
        await expect(fs.stat(created.previewLarge)).rejects.toBeDefined()
      }
    } finally {
      if (mediaId) {
        await prisma.media.delete({ where: { id: mediaId } }).catch(() => undefined)
      }
      await prisma.pathology.delete({ where: { id: pathology.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: category.id } }).catch(() => undefined)

      if (originalPath) await fs.unlink(originalPath).catch(() => undefined)
      if (previewSmallPath) await fs.unlink(previewSmallPath).catch(() => undefined)
      if (previewLargePath) await fs.unlink(previewLargePath).catch(() => undefined)

      await fs.rm(uploadsDir, { recursive: true, force: true }).catch(() => undefined)
      if (typeof previousUploadsDir === "string") {
        process.env.UPLOADS_DIR = previousUploadsDir
      } else {
        delete process.env.UPLOADS_DIR
      }
    }
  })
})

import { describe, expect, it } from "vitest"
import { resolveMediaVariant } from "@/lib/media/file"

describe("resolveMediaVariant", () => {
  it("falls back to original for missing image previews", () => {
    const item = {
      type: "IMAGE",
      filename: "/uploads/original/a.jpg",
      mimeType: "image/jpeg",
      previewSmall: null,
      previewLarge: null,
      poster: null,
    }
    const result = resolveMediaVariant(item, "previewSmall")
    expect(result.filePath).toBe("/uploads/original/a.jpg")
    expect(result.contentType).toBe("image/jpeg")
  })

  it("does not fall back to original for video preview requests", () => {
    const item = {
      type: "VIDEO",
      filename: "/uploads/original/a.mp4",
      mimeType: "video/mp4",
      previewSmall: null,
      previewLarge: null,
      poster: null,
    }
    const result = resolveMediaVariant(item, "previewSmall")
    expect(result.filePath).toBeNull()
    expect(result.contentType).toBe("image/webp")
  })
})

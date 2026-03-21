import { describe, expect, it } from "vitest"
import { buildMediaPaths } from "@/lib/media/storage"

describe("media storage", () => {
  it("builds expected paths", () => {
    const paths = buildMediaPaths({
      baseDir: "/tmp/uploads",
      id: "abc",
      ext: "jpg",
      kind: "image",
    })
    expect(paths.original).toBe("/tmp/uploads/original/abc.jpg")
    expect(paths.previewSmall).toBe("/tmp/uploads/previews/abc_320.webp")
    expect(paths.previewLarge).toBe("/tmp/uploads/previews/abc_960.webp")
  })
})

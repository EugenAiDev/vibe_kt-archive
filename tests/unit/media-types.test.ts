import { describe, expect, it } from "vitest"
import { detectMediaKind } from "@/lib/media/types"

describe("media types", () => {
  it("detects image", () => {
    expect(detectMediaKind("image/png")).toBe("image")
  })

  it("detects video", () => {
    expect(detectMediaKind("video/mp4")).toBe("video")
  })

  it("rejects other", () => {
    expect(() => detectMediaKind("application/pdf")).toThrow("Unsupported")
  })
})

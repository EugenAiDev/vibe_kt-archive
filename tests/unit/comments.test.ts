import { describe, expect, it } from "vitest"
import { ensureReplyAllowed } from "@/lib/comments"

describe("comments", () => {
  it("allows replying to top-level comment", () => {
    expect(() => ensureReplyAllowed({ parentId: null })).not.toThrow()
  })

  it("blocks replying to a reply", () => {
    expect(() => ensureReplyAllowed({ parentId: "parent" })).toThrow("Reply depth exceeded")
  })
})

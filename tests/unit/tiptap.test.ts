import { describe, expect, it } from "vitest"
import { extractTextFromDoc } from "@/lib/tiptap"

describe("tiptap", () => {
  it("extracts text from a simple doc", () => {
    const doc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
    }
    expect(extractTextFromDoc(doc)).toBe("Hello")
  })
})

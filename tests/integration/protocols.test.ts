import { describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"

describe("protocols integration", () => {
  it("creates protocol with optional pathologyId", async () => {
    const protocol = await prisma.protocol.create({
      data: { title: "P1", contentText: "Sample", contentJson: null },
    })
    expect(protocol.title).toBe("P1")
  })
})

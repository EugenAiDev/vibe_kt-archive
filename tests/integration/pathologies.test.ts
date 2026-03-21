import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { PUT as updatePathology } from "@/app/api/pathologies/[id]/route"

vi.mock("@/lib/auth-token", () => ({
  getAuthToken: async () => ({ role: "ADMIN", sub: "pathology-test-user" }),
}))

describe("pathologies integration", () => {
  it("creates and reads pathology", async () => {
    const category = await prisma.category.create({
      data: { name: "Cat", slug: "cat", section: "CT" },
    })

    const created = await prisma.pathology.create({
      data: {
        title: "Test",
        contentText: "Sample",
        contentJson: null,
        categoryId: category.id,
      },
    })

    const fetched = await prisma.pathology.findUnique({ where: { id: created.id } })
    expect(fetched?.title).toBe("Test")
  })

  it("updates pathology fields and category", async () => {
    const firstCategory = await prisma.category.create({
      data: { name: "Cat edit 1", slug: "cat-edit-1", section: "CT" },
    })

    const secondCategory = await prisma.category.create({
      data: { name: "Cat edit 2", slug: "cat-edit-2", section: "XRAY" },
    })

    const pathology = await prisma.pathology.create({
      data: {
        title: "Editable pathology",
        subtitle: "Old subtitle",
        contentText: "Old text",
        contentJson: null,
        categoryId: firstCategory.id,
      },
    })

    try {
      const req = new NextRequest(`http://localhost/api/pathologies/${pathology.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: "Updated pathology",
          subtitle: "New subtitle",
          contentText: "New text",
          contentJson: null,
          categoryId: secondCategory.id,
        }),
        headers: { "Content-Type": "application/json" },
      })

      const res = await updatePathology(req, { params: { id: pathology.id } })
      expect(res.status).toBe(200)

      const updated = await prisma.pathology.findUnique({ where: { id: pathology.id } })
      expect(updated?.title).toBe("Updated pathology")
      expect(updated?.subtitle).toBe("New subtitle")
      expect(updated?.contentText).toBe("New text")
      expect(updated?.categoryId).toBe(secondCategory.id)
    } finally {
      await prisma.pathology.delete({ where: { id: pathology.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: firstCategory.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: secondCategory.id } }).catch(() => undefined)
    }
  })
})

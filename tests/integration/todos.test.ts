import { randomUUID } from "node:crypto"
import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { GET as getTodos } from "@/app/api/todos/route"

vi.mock("@/lib/auth-token", () => ({
  getAuthToken: async () => ({ role: "ADMIN", sub: "todo-test-user" }),
}))

describe("todos integration", () => {
  it("returns global todo list with source links payload", async () => {
    const slug = `todo-${randomUUID().slice(0, 8)}`
    const user = await prisma.user.upsert({
      where: { id: "todo-test-user" },
      update: {
        name: "Todo Admin",
        email: "todo-test-user@kt-archive.local",
        password: "hash",
        role: "ADMIN",
      },
      create: {
        id: "todo-test-user",
        name: "Todo Admin",
        email: "todo-test-user@kt-archive.local",
        password: "hash",
        role: "ADMIN",
      },
    })

    const category = await prisma.category.create({
      data: { name: `Todo ${slug}`, slug, section: "CT" },
    })

    const pathology = await prisma.pathology.create({
      data: {
        title: "Todo source pathology",
        contentText: "Body",
        contentJson: null,
        categoryId: category.id,
      },
    })

    const protocol = await prisma.protocol.create({
      data: {
        title: "Todo source protocol",
        contentText: "Protocol body",
        contentJson: null,
        pathologyId: pathology.id,
      },
    })

    const todo = await prisma.todo.create({
      data: {
        text: "Check protocol wording",
        pathologyId: pathology.id,
        protocolId: protocol.id,
        authorId: user.id,
      },
    })

    try {
      const req = new NextRequest("http://localhost/api/todos?all=1")
      const res = await getTodos(req)
      expect(res.status).toBe(200)

      const items = (await res.json()) as Array<{
        id: string
        pathology: { id: string; title: string } | null
        protocol: { id: string; title: string } | null
      }>

      const created = items.find((item) => item.id === todo.id)
      expect(created).toBeDefined()
      expect(created?.pathology?.id).toBe(pathology.id)
      expect(created?.protocol?.id).toBe(protocol.id)
    } finally {
      await prisma.todo.delete({ where: { id: todo.id } }).catch(() => undefined)
      await prisma.protocol.delete({ where: { id: protocol.id } }).catch(() => undefined)
      await prisma.pathology.delete({ where: { id: pathology.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: category.id } }).catch(() => undefined)
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined)
    }
  })
})

import { randomUUID } from "node:crypto"
import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { POST as createTodo } from "@/app/api/todos/route"
import { POST as createComment } from "@/app/api/comments/route"

vi.mock("@/lib/auth-token", () => ({
  getAuthToken: async () => ({
    sub: "stale-session-user-id",
    email: "session-recovery@kt-archive.local",
    role: "ADMIN",
  }),
}))

describe("session recovery integration", () => {
  it("creates todo and comment even when session sub is stale but email is valid", async () => {
    const slug = `session-${randomUUID().slice(0, 8)}`

    const user = await prisma.user.create({
      data: {
        name: "Recovered Session User",
        email: "session-recovery@kt-archive.local",
        password: "hash",
        role: "ADMIN",
        isActive: true,
      },
    })

    const category = await prisma.category.create({
      data: { name: `Session ${slug}`, slug, section: "CT" },
    })

    const pathology = await prisma.pathology.create({
      data: {
        title: "Recovered Pathology",
        contentText: "Sample",
        contentJson: null,
        categoryId: category.id,
      },
    })

    let todoId: string | null = null
    let commentId: string | null = null

    try {
      const todoReq = new NextRequest("http://localhost/api/todos", {
        method: "POST",
        body: JSON.stringify({
          text: "Recovered todo",
          pathologyId: pathology.id,
        }),
        headers: { "Content-Type": "application/json" },
      })
      const todoRes = await createTodo(todoReq)
      expect(todoRes.status).toBe(200)
      const todo = (await todoRes.json()) as { id: string; authorId: string }
      todoId = todo.id
      expect(todo.authorId).toBe(user.id)

      const commentReq = new NextRequest("http://localhost/api/comments", {
        method: "POST",
        body: JSON.stringify({
          text: "Recovered comment",
          pathologyId: pathology.id,
        }),
        headers: { "Content-Type": "application/json" },
      })
      const commentRes = await createComment(commentReq)
      expect(commentRes.status).toBe(200)
      const comment = (await commentRes.json()) as { id: string; authorId: string }
      commentId = comment.id
      expect(comment.authorId).toBe(user.id)
    } finally {
      if (todoId) await prisma.todo.delete({ where: { id: todoId } }).catch(() => undefined)
      if (commentId) await prisma.comment.delete({ where: { id: commentId } }).catch(() => undefined)
      await prisma.pathology.delete({ where: { id: pathology.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: category.id } }).catch(() => undefined)
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined)
    }
  })
})

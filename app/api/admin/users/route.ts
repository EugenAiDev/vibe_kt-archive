import bcrypt from "bcryptjs"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export const GET = async (req: NextRequest) => {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          comments: true,
          todos: true,
          sessions: true,
        },
      },
    },
  })

  return NextResponse.json(users)
}

export const POST = async (req: NextRequest) => {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const body = await req.json()
  const name = body.name as string | undefined
  const email = body.email as string | undefined
  const password = body.password as string | undefined
  const role = body.role as "ADMIN" | "USER" | "GUEST" | undefined
  const isActive = body.isActive as boolean | undefined

  if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
    return NextResponse.json({ error: "Invalid payload", code: "BAD_REQUEST" }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  })
  if (exists) {
    return NextResponse.json({ error: "Email already exists", code: "CONFLICT" }, { status: 409 })
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      role,
      isActive: isActive ?? true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(user)
}

import bcrypt from "bcryptjs"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { resolveCurrentUserId } from "@/lib/current-user"

type RouteContext = { params: Promise<{ id: string }> | { id: string } }

async function ensureLastAdminSafe(params: {
  userId: string
  nextRole?: "ADMIN" | "USER" | "GUEST"
  nextIsActive?: boolean
  deleting?: boolean
}) {
  const { userId, nextRole, nextIsActive, deleting } = params
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  })

  if (!current) {
    return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const keepsAdmin =
    !deleting &&
    (nextRole ?? current.role) === "ADMIN" &&
    (nextIsActive ?? current.isActive) === true

  if (current.role !== "ADMIN" || keepsAdmin) {
    return null
  }

  const activeAdmins = await prisma.user.count({
    where: {
      role: "ADMIN",
      isActive: true,
    },
  })

  if (activeAdmins <= 1) {
    return NextResponse.json(
      { error: "At least one active admin must remain", code: "LAST_ADMIN" },
      { status: 400 },
    )
  }

  return null
}

export const PUT = async (req: NextRequest, ctx: RouteContext) => {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await Promise.resolve(ctx.params)
  const body = await req.json()
  const name = body.name as string | undefined
  const email = body.email as string | undefined
  const password = body.password as string | undefined
  const role = body.role as "ADMIN" | "USER" | "GUEST" | undefined
  const isActive = body.isActive as boolean | undefined

  if (!name?.trim() || !email?.trim() || !role) {
    return NextResponse.json({ error: "Invalid payload", code: "BAD_REQUEST" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "User not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const conflicting = await prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      NOT: { id },
    },
    select: { id: true },
  })
  if (conflicting) {
    return NextResponse.json({ error: "Email already exists", code: "CONFLICT" }, { status: 409 })
  }

  const lastAdminError = await ensureLastAdminSafe({
    userId: id,
    nextRole: role,
    nextIsActive: isActive,
  })
  if (lastAdminError) return lastAdminError

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      isActive: isActive ?? true,
      ...(password?.trim() ? { password: await bcrypt.hash(password, 10) } : {}),
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

  return NextResponse.json(updated)
}

export const DELETE = async (req: NextRequest, ctx: RouteContext) => {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { id } = await Promise.resolve(ctx.params)
  const currentUserId = await resolveCurrentUserId(auth.token)
  if (currentUserId === id) {
    return NextResponse.json({ error: "You cannot delete yourself", code: "SELF_DELETE" }, { status: 400 })
  }

  const lastAdminError = await ensureLastAdminSafe({
    userId: id,
    deleting: true,
  })
  if (lastAdminError) return lastAdminError

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

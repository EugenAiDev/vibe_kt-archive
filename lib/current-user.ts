import { prisma } from "@/lib/prisma"

type TokenLike = {
  sub?: string | null
  email?: string | null
}

export async function resolveCurrentUserId(token: TokenLike) {
  if (token.sub) {
    const userById = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { id: true },
    })
    if (userById) return userById.id
  }

  if (token.email) {
    const userByEmail = await prisma.user.findUnique({
      where: { email: token.email.toLowerCase() },
      select: { id: true },
    })
    if (userByEmail) return userByEmail.id
  }

  return null
}

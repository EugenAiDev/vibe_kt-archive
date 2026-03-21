import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { Role } from "@/lib/access"

function getHeaderValue(
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = headers?.[key]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.isActive) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        const forwardedFor = getHeaderValue(req.headers, "x-forwarded-for")
        const realIp = getHeaderValue(req.headers, "x-real-ip")
        const userAgent = getHeaderValue(req.headers, "user-agent")

        await prisma.session.create({
          data: {
            userId: user.id,
            ip: forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null,
            userAgent,
          },
        })

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user && "role" in user) token.role = (user as { role: Role }).role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as "ADMIN" | "USER" | "GUEST"
      return session
    },
  },
  pages: { signIn: "/login" },
}

export const handler = NextAuth(authOptions)

import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function getAuthToken(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
  return getToken({ req, secret })
}

import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

export const GET = async (req: NextRequest) => {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const logs = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  return NextResponse.json(logs)
}

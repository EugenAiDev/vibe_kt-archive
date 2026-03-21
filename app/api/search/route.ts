import { NextResponse, type NextRequest } from "next/server"
import { getAuthToken } from "@/lib/auth-token"
import { searchAll } from "@/lib/search"

export const GET = async (req: NextRequest) => {
  const token = await getAuthToken(req)
  if (!token) return NextResponse.json({ error: "Unauthorized", code: "UNAUTH" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""
  if (!q) return NextResponse.json({ pathologies: [], protocols: [] })

  const result = await searchAll(q)
  return NextResponse.json(result)
}

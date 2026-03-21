import { prisma } from "@/lib/prisma"

export async function getDashboardMetrics() {
  const [categories, pathologies, protocols] = await prisma.$transaction([
    prisma.category.count(),
    prisma.pathology.count(),
    prisma.protocol.count(),
  ])

  return { categories, pathologies, protocols }
}

import { describe, expect, it, vi } from "vitest"

const transactionMock = vi.fn().mockResolvedValue([5, 7, 3])

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { count: vi.fn(() => "category-count-operation") },
    pathology: { count: vi.fn(() => "pathology-count-operation") },
    protocol: { count: vi.fn(() => "protocol-count-operation") },
    $transaction: transactionMock,
  },
}))

describe("dashboard metrics", () => {
  it("maps prisma counters into dashboard cards", async () => {
    const { getDashboardMetrics } = await import("@/lib/dashboard")

    await expect(getDashboardMetrics()).resolves.toEqual({
      categories: 5,
      pathologies: 7,
      protocols: 3,
    })

    expect(transactionMock).toHaveBeenCalledOnce()
    expect(transactionMock).toHaveBeenCalledWith([
      "category-count-operation",
      "pathology-count-operation",
      "protocol-count-operation",
    ])
  })
})

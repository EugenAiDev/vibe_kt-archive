import { randomUUID } from "node:crypto"
import { describe, expect, it } from "vitest"
import { prisma } from "@/lib/prisma"
import { searchAll } from "@/lib/search"

describe("search integration", () => {
  it("finds pathology and protocol by contentText", async () => {
    const slug = `search-${randomUUID().slice(0, 8)}`
    const category = await prisma.category.create({
      data: { name: `Search ${slug}`, slug, section: "CT" },
    })

    const pathology = await prisma.pathology.create({
      data: {
        title: "Head",
        contentText: "acute hemorrhage",
        contentJson: null,
        categoryId: category.id,
      },
    })

    const protocol = await prisma.protocol.create({
      data: {
        title: "Protocol A",
        contentText: "acute hemorrhage",
        contentJson: null,
        pathologyId: pathology.id,
      },
    })

    try {
      const result = await searchAll("hemorrhage")
      expect(result.pathologies.some((p) => p.id === pathology.id)).toBe(true)
      expect(result.protocols.some((p) => p.id === protocol.id)).toBe(true)
    } finally {
      await prisma.protocol.delete({ where: { id: protocol.id } }).catch(() => undefined)
      await prisma.pathology.delete({ where: { id: pathology.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: category.id } }).catch(() => undefined)
    }
  })

  it("finds matches by word fragments across titles and body text", async () => {
    const slug = `search-fragment-${randomUUID().slice(0, 8)}`
    const category = await prisma.category.create({
      data: { name: `Search Fragment ${slug}`, slug, section: "CT" },
    })

    const pathology = await prisma.pathology.create({
      data: {
        title: "Нейрогемодинамический конфликт",
        subtitle: "Редкий фрагмент",
        contentText: "В описании отмечен нейрогемодинамический паттерн без острой ишемии.",
        contentJson: null,
        categoryId: category.id,
      },
    })

    const protocol = await prisma.protocol.create({
      data: {
        title: "Шаблон протокола",
        contentText: "Использовать нейрогемодинамический шаблон для описания.",
        contentJson: null,
        pathologyId: pathology.id,
      },
    })

    try {
      const fragmentResult = await searchAll("гемодин")
      const pathologyHit = fragmentResult.pathologies.find((item) => item.id === pathology.id)
      const protocolHit = fragmentResult.protocols.find((item) => item.id === protocol.id)

      expect(pathologyHit).toBeDefined()
      expect(protocolHit).toBeDefined()
      expect(pathologyHit?.snippet).toContain("нейрогемодинами")
      expect(protocolHit?.snippet).toContain("нейрогемодинами")

      const subtitleResult = await searchAll("фрагм")
      expect(subtitleResult.pathologies.some((item) => item.id === pathology.id)).toBe(true)
    } finally {
      await prisma.protocol.delete({ where: { id: protocol.id } }).catch(() => undefined)
      await prisma.pathology.delete({ where: { id: pathology.id } }).catch(() => undefined)
      await prisma.category.delete({ where: { id: category.id } }).catch(() => undefined)
    }
  })
})

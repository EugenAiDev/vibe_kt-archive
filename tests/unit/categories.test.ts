import { describe, expect, it } from "vitest"
import { buildCategoryTree, canDeleteCategory } from "@/lib/api"
import {
  flattenCategoryTree,
  findCategoryPath,
  findCategoryPathIds,
  getDefaultOpenCategoryIds,
} from "@/lib/categories"

describe("canDeleteCategory", () => {
  it("prevents deletion of locked categories", () => {
    expect(canDeleteCategory({ isLocked: true })).toBe(false)
  })

  it("allows deletion of unlocked categories", () => {
    expect(canDeleteCategory({ isLocked: false })).toBe(true)
  })
})

describe("buildCategoryTree", () => {
  it("nests children by parentId", () => {
    const flat = [
      { id: "1", name: "Root", parentId: null },
      { id: "2", name: "Child", parentId: "1" },
    ]
    const tree = buildCategoryTree(flat)
    expect(tree).toHaveLength(1)
    expect(tree[0].children?.[0].id).toBe("2")
  })
})

describe("flattenCategoryTree", () => {
  it("creates full-path labels and root ids", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        children: [
          {
            id: "head",
            name: "Голова",
            parentId: "ct",
            children: [{ id: "brain", name: "Головной мозг", parentId: "head" }],
          },
        ],
      },
      { id: "xray", name: "Рентген", parentId: null, children: [] },
    ]

    const flat = flattenCategoryTree(tree)
    const brain = flat.find((item) => item.id === "brain")
    expect(brain?.pathLabel).toBe("КТ → Голова → Головной мозг")
    expect(brain?.rootId).toBe("ct")
    expect(flat[0].id).toBe("ct")
  })

  it("preserves preorder based on order field", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        order: 2,
        children: [
          { id: "b", name: "B", parentId: "ct", order: 2, children: [] },
          { id: "a", name: "A", parentId: "ct", order: 1, children: [] },
        ],
      },
      { id: "xray", name: "Рентген", parentId: null, order: 1, children: [] },
    ]

    const flat = flattenCategoryTree(tree)
    expect(flat.map((item) => item.id)).toEqual(["xray", "ct", "a", "b"])
  })
})

describe("findCategoryPathIds", () => {
  it("returns ancestor chain to the target", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        children: [
          {
            id: "head",
            name: "Голова",
            parentId: "ct",
            children: [{ id: "brain", name: "Головной мозг", parentId: "head" }],
          },
        ],
      },
    ]

    expect(findCategoryPathIds(tree, "brain")).toEqual(["ct", "head", "brain"])
  })

  it("returns empty array when not found", () => {
    const tree = [{ id: "ct", name: "КТ", parentId: null, children: [] }]
    expect(findCategoryPathIds(tree, "missing")).toEqual([])
  })
})

describe("findCategoryPath", () => {
  it("returns full category chain with names", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        children: [
          {
            id: "head",
            name: "Голова",
            parentId: "ct",
            children: [{ id: "brain", name: "Головной мозг", parentId: "head" }],
          },
        ],
      },
    ]

    expect(findCategoryPath(tree, "brain").map((item) => item.name)).toEqual([
      "КТ",
      "Голова",
      "Головной мозг",
    ])
  })
})

describe("getDefaultOpenCategoryIds", () => {
  it("opens only root sections by default", () => {
    const tree = [
      {
        id: "ct",
        name: "КТ",
        parentId: null,
        children: [{ id: "head", name: "Голова", parentId: "ct", children: [] }],
      },
      {
        id: "xray",
        name: "Рентген",
        parentId: null,
        children: [{ id: "chest", name: "Грудная клетка", parentId: "xray", children: [] }],
      },
    ]

    expect(getDefaultOpenCategoryIds(tree)).toEqual(["ct", "xray"])
  })
})

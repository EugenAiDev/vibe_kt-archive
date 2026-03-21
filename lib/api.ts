export function canDeleteCategory(params: { isLocked: boolean }) {
  return params.isLocked === false
}

type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  children?: CategoryNode[]
}

export function buildCategoryTree(flat: CategoryNode[]) {
  const map = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const item of flat) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of flat) {
    const node = map.get(item.id)!
    if (item.parentId) {
      const parent = map.get(item.parentId)
      if (parent) parent.children?.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

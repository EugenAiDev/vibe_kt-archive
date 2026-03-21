export type CategoryNode = {
  id: string
  name: string
  parentId: string | null
  order?: number
  children?: CategoryNode[]
}

export type FlatCategory = {
  id: string
  name: string
  pathLabel: string
  rootId: string
}

export function getDefaultOpenCategoryIds(nodes: CategoryNode[]) {
  return [...nodes]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((node) => node.id)
}

export function flattenCategoryTree(nodes: CategoryNode[]): FlatCategory[] {
  const result: FlatCategory[] = []

  const sortByOrder = (items: CategoryNode[]) =>
    [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const walk = (node: CategoryNode, path: string[], rootId: string) => {
    const nextPath = [...path, node.name]
    result.push({
      id: node.id,
      name: node.name,
      pathLabel: nextPath.join(" → "),
      rootId,
    })

    sortByOrder(node.children ?? []).forEach((child) => walk(child, nextPath, rootId))
  }

  sortByOrder(nodes).forEach((node) => walk(node, [], node.id))
  return result
}

export function findCategoryPathIds(nodes: CategoryNode[], targetId: string): string[] {
  const path: string[] = []

  const visit = (node: CategoryNode): boolean => {
    path.push(node.id)
    if (node.id === targetId) return true
    if (node.children?.some((child) => visit(child))) return true
    path.pop()
    return false
  }

  for (const node of nodes) {
    if (visit(node)) return [...path]
  }

  return []
}

export function findCategoryPath(nodes: CategoryNode[], targetId: string): CategoryNode[] {
  const ids = findCategoryPathIds(nodes, targetId)
  if (!ids.length) return []

  const map = new Map<string, CategoryNode>()
  const visit = (node: CategoryNode) => {
    map.set(node.id, node)
    node.children?.forEach(visit)
  }

  nodes.forEach(visit)
  return ids.map((id) => map.get(id)).filter((node): node is CategoryNode => Boolean(node))
}

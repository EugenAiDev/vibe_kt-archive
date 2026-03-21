type TiptapNode = {
  type?: string
  text?: string
  content?: TiptapNode[]
}

export function extractTextFromDoc(node: TiptapNode | null | undefined): string {
  if (!node) return ""
  if (node.type === "text") return node.text ?? ""
  if (!node.content) return ""
  return node.content
    .map(extractTextFromDoc)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

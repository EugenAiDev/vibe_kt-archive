export function ensureReplyAllowed(parent: { parentId: string | null }) {
  if (parent.parentId) throw new Error("Reply depth exceeded")
}

import { useQuery } from "@tanstack/react-query"
import type { CategoryNode } from "@/lib/categories"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories")
      return (await res.json()) as CategoryNode[]
    },
  })
}

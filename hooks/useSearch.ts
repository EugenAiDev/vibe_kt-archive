import { useQuery } from "@tanstack/react-query"

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async () =>
      (await fetch(`/api/search?q=${encodeURIComponent(query)}`)).json(),
    enabled: query.trim().length > 0,
    staleTime: 10_000,
  })
}

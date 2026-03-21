import SearchPageClient from "@/components/search/SearchPageClient"

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const searchParams = await props.searchParams
  const initialQuery = Array.isArray(searchParams.q) ? searchParams.q[0] ?? "" : searchParams.q ?? ""
  return <SearchPageClient initialQuery={initialQuery} />
}

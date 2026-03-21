import { NewPathologyPageClient } from "@/components/pathology/NewPathologyPageClient"

export default async function NewPathologyPage(props: {
  searchParams: Promise<{ categoryId?: string }>
}) {
  const searchParams = await props.searchParams
  return <NewPathologyPageClient initialCategoryId={searchParams.categoryId} />
}

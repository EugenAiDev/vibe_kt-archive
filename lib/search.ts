import { prisma } from "@/lib/prisma"

export type PathologySearchResult = {
  id: string
  title: string
  subtitle: string | null
  snippet: string
}

export type ProtocolSearchResult = {
  id: string
  title: string
  snippet: string
}

type PathologySearchRow = {
  id: string
  title: string
  subtitle: string | null
  contentText: string
}

type ProtocolSearchRow = {
  id: string
  title: string
  contentText: string
}

function tokenizeSearchQuery(query: string) {
  return Array.from(
    new Set(
      query
        .toLocaleLowerCase()
        .split(/\s+/)
        .map((term) => term.replace(/[^\p{L}\p{N}]+/gu, ""))
        .filter(Boolean),
    ),
  )
}

function buildPrefixTsQuery(terms: string[]) {
  const normalized = terms
    .map((term) => term.replace(/'/g, ""))
    .filter((term) => term.length >= 3)
  return normalized.length ? normalized.map((term) => `${term}:*`).join(" & ") : null
}

function buildSnippet(text: string | null | undefined, query: string) {
  const source = text?.trim()
  if (!source) return "Текст описания пока не заполнен."

  const lowerSource = source.toLocaleLowerCase()
  const queryTerms = [query.toLocaleLowerCase(), ...tokenizeSearchQuery(query)]
  const hitIndex = queryTerms
    .map((term) => lowerSource.indexOf(term))
    .find((index) => index >= 0)

  if (hitIndex === undefined) {
    return source.length > 180 ? `${source.slice(0, 180).trim()}…` : source
  }

  const start = Math.max(0, hitIndex - 70)
  const end = Math.min(source.length, hitIndex + 110)
  const prefix = start > 0 ? "…" : ""
  const suffix = end < source.length ? "…" : ""

  return `${prefix}${source.slice(start, end).trim()}${suffix}`
}

export async function searchAll(query: string) {
  const q = query.trim()
  if (!q) return { pathologies: [], protocols: [] }

  const terms = tokenizeSearchQuery(q)
  const phrasePattern = `%${q}%`
  const termPatterns = terms.map((term) => `%${term}%`)
  const prefixTsQuery = buildPrefixTsQuery(terms)

  const params = [phrasePattern, ...termPatterns]
  if (prefixTsQuery) params.push(prefixTsQuery)
  const prefixQueryIndex = prefixTsQuery ? params.length : null
  const termRefs = termPatterns.map((_, index) => `$${index + 2}`)

  const pathologyWhere = [
    `title ILIKE $1`,
    `coalesce(subtitle, '') ILIKE $1`,
    `"contentText" ILIKE $1`,
    ...termRefs.map(
      (ref) => `concat_ws(' ', title, coalesce(subtitle, ''), "contentText") ILIKE ${ref}`,
    ),
    ...(prefixQueryIndex
      ? [`"searchVector" @@ to_tsquery('russian', $${prefixQueryIndex})`]
      : []),
  ].join(" OR ")

  const pathologyScore = [
    `CASE WHEN title ILIKE $1 THEN 500 ELSE 0 END`,
    `CASE WHEN coalesce(subtitle, '') ILIKE $1 THEN 320 ELSE 0 END`,
    `CASE WHEN "contentText" ILIKE $1 THEN 200 ELSE 0 END`,
    ...termRefs.map((ref) => `CASE WHEN title ILIKE ${ref} THEN 120 ELSE 0 END`),
    ...termRefs.map((ref) => `CASE WHEN coalesce(subtitle, '') ILIKE ${ref} THEN 80 ELSE 0 END`),
    ...termRefs.map((ref) => `CASE WHEN "contentText" ILIKE ${ref} THEN 60 ELSE 0 END`),
    ...(prefixQueryIndex
      ? [`COALESCE(ts_rank_cd("searchVector", to_tsquery('russian', $${prefixQueryIndex})), 0) * 100`]
      : []),
  ].join(" + ")

  const protocolWhere = [
    `title ILIKE $1`,
    `"contentText" ILIKE $1`,
    ...termRefs.map((ref) => `concat_ws(' ', title, "contentText") ILIKE ${ref}`),
    ...(prefixQueryIndex
      ? [`"searchVector" @@ to_tsquery('russian', $${prefixQueryIndex})`]
      : []),
  ].join(" OR ")

  const protocolScore = [
    `CASE WHEN title ILIKE $1 THEN 500 ELSE 0 END`,
    `CASE WHEN "contentText" ILIKE $1 THEN 220 ELSE 0 END`,
    ...termRefs.map((ref) => `CASE WHEN title ILIKE ${ref} THEN 120 ELSE 0 END`),
    ...termRefs.map((ref) => `CASE WHEN "contentText" ILIKE ${ref} THEN 60 ELSE 0 END`),
    ...(prefixQueryIndex
      ? [`COALESCE(ts_rank_cd("searchVector", to_tsquery('russian', $${prefixQueryIndex})), 0) * 100`]
      : []),
  ].join(" + ")

  const pathologies = await prisma.$queryRawUnsafe<PathologySearchRow[]>(
    `
      SELECT id, title, subtitle, "contentText"
      FROM "Pathology"
      WHERE ${pathologyWhere}
      ORDER BY (${pathologyScore}) DESC, "updatedAt" DESC
      LIMIT 50
    `,
    ...params,
  )

  const protocols = await prisma.$queryRawUnsafe<ProtocolSearchRow[]>(
    `
      SELECT id, title, "contentText"
      FROM "Protocol"
      WHERE ${protocolWhere}
      ORDER BY (${protocolScore}) DESC, "updatedAt" DESC
      LIMIT 50
    `,
    ...params,
  )

  return {
    pathologies: pathologies.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      snippet: buildSnippet(item.contentText || item.subtitle, q),
    })) satisfies PathologySearchResult[],
    protocols: protocols.map((item) => ({
      id: item.id,
      title: item.title,
      snippet: buildSnippet(item.contentText, q),
    })) satisfies ProtocolSearchResult[],
  }
}

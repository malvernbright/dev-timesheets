export function serializeFilters(filters: Record<string, unknown>): string {
  const sortedEntries = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(sortedEntries)
}

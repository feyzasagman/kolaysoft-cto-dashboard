const STORAGE_KEY = 'cto_known_project_ids'

/** PM’nin eriştiği proje id’lerini saklar (liste endpointi olmadığı için). */
export function getKnownProjectIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
  } catch {
    return []
  }
}

export function rememberProjectId(projectId: number) {
  if (!Number.isFinite(projectId) || projectId <= 0) return
  const next = Array.from(new Set([...getKnownProjectIds(), projectId]))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function rememberProjectIds(projectIds: number[]) {
  projectIds.forEach(rememberProjectId)
}

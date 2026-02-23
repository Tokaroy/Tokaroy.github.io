import type { Source } from '@/types'

const DRAFT_KEY = 'infosec_sources_draft_v1'

export function loadDraftSources(): Source[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Source[]) : []
  } catch {
    return []
  }
}

export function saveDraftSources(sources: Source[]) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(sources, null, 2))
}

export function clearDraftSources() {
  localStorage.removeItem(DRAFT_KEY)
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}

export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text()
  return JSON.parse(text)
}

export function uniqueTagsFromSources(sources: Source[]) {
  const set = new Set<string>()
  for (const s of sources) for (const t of s.tags || []) set.add(t)
  return Array.from(set).sort((a,b) => a.localeCompare(b))
}

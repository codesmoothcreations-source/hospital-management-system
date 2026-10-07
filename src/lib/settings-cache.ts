// src/lib/settings-cache.ts
// Module-level cache — survives across renders, shared app-wide

type CacheEntry = { data: any[]; timestamp: number; promise?: Promise<any[]> }

const cache = new Map<string, CacheEntry>()
const TTL = 5 * 60 * 1000 // 5 minutes
const inflight = new Map<string, Promise<any[]>>()

export async function getSettings(category: string, force = false): Promise<any[]> {
  const now = Date.now()
  const cached = cache.get(category)

  if (!force && cached && now - cached.timestamp < TTL) {
    return cached.data
  }

  // Deduplicate concurrent requests
  if (inflight.has(category)) return inflight.get(category)!

  const promise = fetch(`/api/settings?category=${encodeURIComponent(category)}`)
    .then((r) => r.json())
    .then((data) => {
      cache.set(category, { data, timestamp: Date.now() })
      inflight.delete(category)
      return data
    })
    .catch(() => {
      inflight.delete(category)
      return []
    })

  inflight.set(category, promise)
  return promise
}

export function invalidateSettings(category?: string) {
  if (category) cache.delete(category)
  else cache.clear()
}

// Prefetch multiple categories at once (call on app load)
export function prefetchSettings(categories: string[]) {
  categories.forEach((c) => getSettings(c).catch(() => {}))
}
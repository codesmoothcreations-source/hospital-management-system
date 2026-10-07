// src/components/providers/prefetch.tsx
"use client"
import { useEffect } from "react"
import { prefetchSettings } from "@/lib/settings-cache"

const CATEGORIES_TO_PREFETCH = [
  "department",
  "ward",
  "brand",
  "processor",
  "generation",
  "location",
]

export function SettingsPrefetcher() {
  useEffect(() => {
    // Warm the cache after initial render so first dropdown is instant
    const timer = setTimeout(() => {
      prefetchSettings(CATEGORIES_TO_PREFETCH)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return null
}
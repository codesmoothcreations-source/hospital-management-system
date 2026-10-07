// src/components/ui/autocomplete.tsx
"use client"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Loader2, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSettings, invalidateSettings } from "@/lib/settings-cache"
import { toast } from "sonner"

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  category: string           // e.g., "department" or "location:Radiology"
  placeholder?: string
  className?: string
  allowCreate?: boolean       // show "Add X" option in dropdown
  disabled?: boolean
  required?: boolean
  color?: string              // dot color for suggestions
}

export function Autocomplete({
  value,
  onChange,
  category,
  placeholder = "Type to search...",
  className,
  allowCreate = true,
  disabled = false,
  required = false,
  color = "bg-primary",
}: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load options when category changes or on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getSettings(category)
      if (!cancelled) {
        setOptions(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [category])

  // Filtered suggestions — fuzzy-ish prefix + substring match
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return options.slice(0, 8)
    return options
      .filter((o) => o.value.toLowerCase().includes(q))
      .sort((a, b) => {
        // Prefix matches first
        const aStarts = a.value.toLowerCase().startsWith(q) ? 0 : 1
        const bStarts = b.value.toLowerCase().startsWith(q) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        // Then alphabetical
        return a.value.localeCompare(b.value)
      })
      .slice(0, 8)
  }, [value, options])

  const exactMatch = options.some(
    (o) => o.value.toLowerCase() === value.trim().toLowerCase()
  )
  const showCreate = allowCreate && value.trim().length >= 2 && !exactMatch

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Reset highlight when filtered list changes
  useEffect(() => { setHighlightIndex(0) }, [value])

  const selectOption = useCallback((optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
    inputRef.current?.blur()
  }, [onChange])

  async function createOption() {
    const newValue = value.trim()
    if (!newValue) return
    setCreating(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, value: newValue }),
      })
      if (res.ok) {
        const created = await res.json()
        // Update local cache + state
        invalidateSettings(category)
        setOptions((prev) => [...prev, created].sort((a, b) => a.value.localeCompare(b.value)))
        toast.success(`Added "${newValue}"`)
        setOpen(false)
        inputRef.current?.blur()
      } else {
        const err = await res.json()
        toast.error(err.error ?? "Failed to add")
      }
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true)
      return
    }
    if (!open) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1 + (showCreate ? 1 : 0)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlightIndex < filtered.length) {
        selectOption(filtered[highlightIndex].value)
      } else if (showCreate) {
        createOption()
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          spellCheck={true}
          autoComplete="off"
          className="h-11 pr-9"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={() => { onChange(""); inputRef.current?.focus() }}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {open && (filtered.length > 0 || showCreate || loading) && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-lg border bg-white dark:bg-slate-900 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {loading && options.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectOption(opt.value) }}
                  onMouseEnter={() => setHighlightIndex(i)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                    highlightIndex === i
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full shrink-0", color)} />
                  <span className="flex-1 truncate">{opt.value}</span>
                  {value.trim().toLowerCase() === opt.value.toLowerCase() && (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </button>
              ))}

              {showCreate && (
                <>
                  {filtered.length > 0 && <div className="border-t my-1" />}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); createOption() }}
                    onMouseEnter={() => setHighlightIndex(filtered.length)}
                    disabled={creating}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                      highlightIndex === filtered.length
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                        : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    )}
                  >
                    {creating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                    <span className="flex-1">
                      Add <strong>"{value.trim()}"</strong>
                    </span>
                  </button>
                </>
              )}

              {filtered.length === 0 && !showCreate && !loading && (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No matches.
                  {/* No matches. Type more or add a new one. */}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
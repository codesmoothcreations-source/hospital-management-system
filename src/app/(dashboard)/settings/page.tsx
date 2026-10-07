// src/app/(dashboard)/settings/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Building2, MapPin, BedDouble, Tag, Cpu, Zap, Plus, X, Loader2,
  Pencil, Check, Search, Save,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { invalidateSettings } from "@/lib/settings-cache"

interface Setting { id: string; category: string; value: string }

const CATEGORIES = [
  {
    key: "department",
    label: "Departments",
    description: "Hospital departments where devices are assigned (e.g., Radiology, Cardiology)",
    icon: Building2,
    color: "text-purple-600",
    dot: "bg-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    key: "location",
    label: "General Locations",
    description: "Building-wide locations not tied to a specific department",
    icon: MapPin,
    color: "text-blue-600",
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "ward",
    label: "Wards",
    description: "Hospital wards for patient care (e.g., Ward 1A, ICU, NICU)",
    icon: BedDouble,
    color: "text-emerald-600",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "brand",
    label: "Device Brands",
    description: "Manufacturers of your equipment (e.g., Dell, HP, Lenovo, Cisco)",
    icon: Tag,
    color: "text-amber-600",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    key: "processor",
    label: "Processors",
    description: "CPU models used in your machines (e.g., Intel Core i5, AMD Ryzen 5)",
    icon: Cpu,
    color: "text-red-600",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  {
    key: "generation",
    label: "Generations",
    description: "Processor generations (e.g., 10th Gen, 11th Gen, 12th Gen)",
    icon: Zap,
    color: "text-indigo-600",
    dot: "bg-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [newValues, setNewValues] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null)
  const [search, setSearch] = useState("")

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/settings")
      setSettings(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function addSetting(category: string) {
    const value = newValues[category]?.trim()
    if (!value) return
    setAdding(category)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, value }),
      })
      if (res.ok) {
        const created = await res.json()
        setSettings((prev) => [...prev, created])
        setNewValues({ ...newValues, [category]: "" })
        invalidateSettings(category)
        toast.success(`Added "${value}"`)
      } else {
        const err = await res.json()
        toast.error(err.error ?? "Failed to add")
      }
    } finally {
      setAdding(null)
    }
  }

  async function deleteSetting(id: string, category: string, value: string) {
    if (!confirm(`Delete "${value}"?`)) return
    const res = await fetch(`/api/settings/${id}`, { method: "DELETE" })
    if (res.ok) {
      setSettings((prev) => prev.filter((s) => s.id !== id))
      invalidateSettings(category)
      toast.success("Deleted")
    }
  }

  async function saveEdit() {
    if (!editing) return
    const res = await fetch(`/api/settings/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: editing.value }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSettings((prev) => prev.map((s) => (s.id === editing.id ? updated : s)))
      invalidateSettings(updated.category)
      toast.success("Updated")
      setEditing(null)
    }
  }

  const filteredCategories = CATEGORIES.filter((cat) => {
    if (!search) return true
    const s = search.toLowerCase()
    if (cat.label.toLowerCase().includes(s)) return true
    return settings.some(
      (x) => x.category === cat.key && x.value.toLowerCase().includes(s)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage reference data used across the system. New items appear instantly in every dropdown.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredCategories.map((cat) => {
            const items = settings.filter((s) => s.category === cat.key)
            const Icon = cat.icon
            return (
              <Card key={cat.key} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2.5 rounded-xl", cat.bg)}>
                      <Icon className={cn("h-5 w-5", cat.color)} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {cat.label}
                        <Badge variant="outline" className="text-xs">
                          {items.length}
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Items list */}
                  <div className="flex flex-wrap gap-2 min-h-[36px]">
                    {items.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No items yet — add your first one below
                      </p>
                    ) : (
                      items.map((item) => (
                        <Badge
                          key={item.id}
                          variant="secondary"
                          className={cn(
                            "flex items-center gap-1.5 py-1.5 pl-2.5 pr-1.5 group",
                            "hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", cat.dot)} />
                          {editing?.id === item.id ? (
                            <>
                              <Input
                                autoFocus
                                value={editing.value}
                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") setEditing(null)
                                }}
                                className="h-6 text-xs w-32"
                                spellCheck={true}
                              />
                              <button onClick={saveEdit} className="p-0.5 hover:text-emerald-600">
                                <Check className="h-3 w-3" />
                              </button>
                              <button onClick={() => setEditing(null)} className="p-0.5 hover:text-red-600">
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-medium">{item.value}</span>
                              <button
                                onClick={() => setEditing({ id: item.id, value: item.value })}
                                className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                                title="Edit"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
                              <button
                                onClick={() => deleteSetting(item.id, cat.key, item.value)}
                                className="p-0.5 hover:text-destructive opacity-60 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </Badge>
                      ))
                    )}
                  </div>

                  {/* Add new */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      placeholder={`Add new ${cat.label.toLowerCase().replace(/s$/, "")}...`}
                      value={newValues[cat.key] ?? ""}
                      onChange={(e) => setNewValues({ ...newValues, [cat.key]: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addSetting(cat.key)}
                      spellCheck={true}
                      className="h-9 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => addSetting(cat.key)}
                      disabled={adding === cat.key || !newValues[cat.key]?.trim()}
                      className="h-9"
                    >
                      {adding === cat.key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
// src/app/(dashboard)/settings/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

const categories = [
  { key: "department", label: "Departments" },
  { key: "location", label: "Locations" },
  { key: "ward", label: "Wards" },
  { key: "brand", label: "Brands" },
  { key: "processor", label: "Processors" },
  { key: "generation", label: "Generations" },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [newValues, setNewValues] = useState<Record<string, string>>({})

  const fetchSettings = async () => {
    const res = await fetch("/api/settings")
    setSettings(await res.json())
  }

  useEffect(() => { fetchSettings() }, [])

  const addSetting = async (category: string) => {
    const value = newValues[category]?.trim()
    if (!value) return
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, value }),
    })
    setNewValues({ ...newValues, [category]: "" })
    fetchSettings()
  }

  const deleteSetting = async (id: string) => {
    await fetch(`/api/settings/${id}`, { method: "DELETE" })
    fetchSettings()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage reference data for the system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => {
          const items = settings.filter((s) => s.category === cat.key)
          return (
            <Card key={cat.key}>
              <CardHeader><CardTitle>{cat.label}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <Badge key={item.id} variant="secondary" className="flex items-center gap-1">
                      {item.value}
                      <button onClick={() => deleteSetting(item.id)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {items.length === 0 && (
                    <p className="text-sm text-muted-foreground">No items yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={`Add ${cat.label.toLowerCase()}...`}
                    value={newValues[cat.key] || ""}
                    onChange={(e) => setNewValues({ ...newValues, [cat.key]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && addSetting(cat.key)}
                  />
                  <Button size="icon" onClick={() => addSetting(cat.key)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
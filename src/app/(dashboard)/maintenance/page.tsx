// src/app/(dashboard)/maintenance/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, Wrench } from "lucide-react"
import { toast } from "sonner"

export default function MaintenancePage() {
  const [device, setDevice] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [notes, setNotes] = useState("")
  const [remarks, setRemarks] = useState("")
  const [cost, setCost] = useState("")

  const handleSubmit = async () => {
    const res = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: device.id, notes, remarks, cost, department: device.department, location: device.location }),
    })
    if (res.ok) {
      toast.success("Maintenance logged")
      setDevice(null); setNotes(""); setRemarks(""); setCost("")
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <p className="text-muted-foreground">Log maintenance activities for equipment</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Find Device</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search device..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={async () => {
              const res = await fetch(`/api/devices?search=${search}`)
              const data = await res.json()
              if (data.devices.length > 0) setDevice(data.devices[0])
            }}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {device && (
        <Card>
          <CardHeader><CardTitle>Maintenance Log</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="font-medium">{device.name}</p>
              <p className="text-sm text-muted-foreground">{device.department} • {device.location}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">What was done? *</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Replaced thermal paste, cleaned dust..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks</label>
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g., Resolved" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cost (if any)</label>
                <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={!notes} className="w-full">
              <Wrench className="mr-2 h-4 w-4" /> Log Maintenance
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
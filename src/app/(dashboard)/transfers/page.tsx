// src/app/(dashboard)/transfers/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, ArrowRight, MapPin, Building } from "lucide-react"
import { toast } from "sonner"

export default function TransfersPage() {
  const [device, setDevice] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [toDepartment, setToDepartment] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [toWard, setToWard] = useState("")
  const [notes, setNotes] = useState("")

  const searchDevice = async () => {
    const res = await fetch(`/api/devices?search=${search}`)
    const data = await res.json()
    if (data.devices.length > 0) {
      setDevice(data.devices[0])
    } else {
      toast.error("Device not found")
    }
  }

  const handleTransfer = async () => {
    const res = await fetch(`/api/devices/${device.id}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toDepartment, toLocation, toWard, notes }),
    })
    if (res.ok) {
      toast.success("Device transferred successfully")
      setDevice(null)
      setToDepartment(""); setToLocation(""); setToWard(""); setNotes("")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transfer Device</h1>
        <p className="text-muted-foreground">Move equipment between departments, locations, or wards</p>
      </div>

      {/* Step 1: Search Device */}
      <Card>
        <CardHeader><CardTitle>1. Find Device</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, asset tag, or serial number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && searchDevice()}
              />
            </div>
            <Button onClick={searchDevice}>Search</Button>
          </div>

          {device && (
            <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div>
                <p className="font-medium">{device.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{device.assetTag}</p>
                <p className="text-sm text-muted-foreground">
                  <Building className="inline h-3 w-3 mr-1" />{device.department} • {device.location}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDevice(null)}>Change</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {device && (
        <>
          {/* Step 2: Destination */}
          <Card>
            <CardHeader><CardTitle>2. Transfer Destination</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">To Department *</label>
                <Input value={toDepartment} onChange={(e) => setToDepartment(e.target.value)} placeholder="e.g., Cardiology" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Location *</label>
                <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} placeholder="e.g., 3rd Floor, Room 312" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To Ward</label>
                <Input value={toWard} onChange={(e) => setToWard(e.target.value)} placeholder="e.g., Ward 5A" />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Notes */}
          <Card>
            <CardHeader><CardTitle>3. Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for transfer, special instructions..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleTransfer} disabled={!toDepartment || !toLocation}>
              <ArrowRight className="mr-2 h-4 w-4" /> Complete Transfer
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
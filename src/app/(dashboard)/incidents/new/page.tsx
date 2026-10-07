// src/app/(dashboard)/incidents/new/page.tsx
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Search, AlertTriangle, Package, Building, MapPin, BedDouble,
  Loader2, CheckCircle2, XCircle, ChevronLeft, Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Autocomplete } from "@/components/ui/autocomplete"

// Color-coded incident types
const INCIDENT_TYPES = {
  SPOILT: {
    label: "Spoilt",
    description: "Device has malfunctioned",
    icon: Wrench,
    color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
    ring: "ring-amber-400",
  },
  STOLEN: {
    label: "Stolen",
    description: "Device was taken",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300",
    ring: "ring-red-400",
  },
  LOST: {
    label: "Lost",
    description: "Device cannot be located",
    icon: XCircle,
    color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300",
    ring: "ring-orange-400",
  },
} as const

type IncidentType = keyof typeof INCIDENT_TYPES

interface Setting {
  id: string
  category: string
  value: string
}

export default function NewIncidentPage() {
  const router = useRouter()

  // Device search
  const [device, setDevice] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)

  // Form fields
  const [department, setDepartment] = useState("")
  const [location, setLocation] = useState("")
  const [ward, setWard] = useState("")
  const [notes, setNotes] = useState("")
  const [remarks, setRemarks] = useState<IncidentType>("SPOILT")
  const [submitting, setSubmitting] = useState(false)

  // Dropdown data
  const [wards, setWards] = useState<Setting[]>([])

  useEffect(() => {
    fetch("/api/settings?category=ward")
      .then((r) => r.json())
      .then(setWards)
  }, [])

  // Auto-fill location from device when found
  useEffect(() => {
    if (device) {
      setDepartment(device.department ?? "")
      setLocation(device.location ?? "")
      setWard(device.ward ?? "")
    }
  }, [device])

  async function searchDevice() {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/devices?search=${encodeURIComponent(search)}&limit=1`)
      const data = await res.json()
      if (data.devices?.length > 0) {
        setDevice(data.devices[0])
        toast.success(`Found: ${data.devices[0].name}`)
      } else {
        toast.error("No device found")
        setDevice(null)
      }
    } finally {
      setSearching(false)
    }
  }

  async function submit() {
    if (!device || !notes.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: device.id,
          department,
          location,
          ward: ward || null,
          notes,
          remarks,
        }),
      })
      if (res.ok) {
        toast.success(`✅ Incident reported: ${INCIDENT_TYPES[remarks].label}`)
        router.push("/incidents")
      } else {
        toast.error("Failed to report incident")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button + header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/incidents")}
          className="mb-2 -ml-2 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Incidents
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Report Incident</h1>
        <p className="text-muted-foreground">
          Record a spoilt, stolen, or lost device
        </p>
      </div>

      {/* STEP 1: Find device */}
      <Card className="border-l-4 border-l-red-500 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold">
              1
            </span>
            Find Device
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, asset tag, or serial number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchDevice()}
                className="pl-10 h-11"
              />
            </div>
            <Button
              onClick={searchDevice}
              disabled={searching}
              className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {device && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-slate-50 dark:from-red-950/30 dark:to-slate-900 border border-red-200 dark:border-red-800">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/50">
                <Package className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{device.name}</p>
                <p className="text-sm font-mono text-muted-foreground">{device.assetTag}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Building className="h-3.5 w-3.5" /> {device.department}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {device.location}
                  </span>
                  {device.ward && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BedDouble className="h-3.5 w-3.5" /> {device.ward}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDevice(null)}>
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STEP 2: Incident type */}
      {device && (
        <Card className="border-l-4 border-l-amber-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                2
              </span>
              Incident Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {(Object.keys(INCIDENT_TYPES) as IncidentType[]).map((key) => {
                const cfg = INCIDENT_TYPES[key]
                const Icon = cfg.icon
                const selected = remarks === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRemarks(key)}
                    className={cn(
                      "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      selected
                        ? `${cfg.color} border-current shadow-md ring-2 ${cfg.ring}`
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className="h-5 w-5" />
                      {selected && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cfg.label}</p>
                      <p className="text-xs opacity-75 mt-0.5">{cfg.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Details */}
      {device && (
        <Card className="border-l-4 border-l-purple-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">
                3
              </span>
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-500" />
                Department
              </label>
              <Autocomplete
                value={department}
                onChange={setDepartment}
                category="department"
                color="bg-purple-500"
                placeholder="Department"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                Location
              </label>
              <Autocomplete
                value={location}
                onChange={setLocation}
                category={department ? `location:${department}` : "location"}
                color="bg-blue-500"
                placeholder="Location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-purple-500" />
                Ward
              </label>
              <Autocomplete
                value={ward}
                onChange={setWard}
                category="ward"
                color="bg-emerald-500"
                placeholder="Ward"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Notes & Submit */}
      {device && (
        <Card className="border-l-4 border-l-emerald-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                4
              </span>
              Notes & Submit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description of Incident <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what happened — when, how, any witnesses, current condition..."
                rows={4}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <Button
                onClick={submit}
                disabled={submitting || !notes.trim()}
                className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                Submit Incident Report
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/incidents")}
                disabled={submitting}
                className="h-11"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
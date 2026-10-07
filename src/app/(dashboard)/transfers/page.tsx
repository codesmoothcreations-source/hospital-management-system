// src/app/(dashboard)/transfers/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Search, ArrowRight, MapPin, Building, BedDouble, CheckCircle2,
  Clock, AlertTriangle, Loader2, XCircle, Package,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Autocomplete } from "@/components/ui/autocomplete"

// ─── Color-coded status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  DIFFICULTY: {
    label: "Difficulty",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300",
    dot: "bg-red-500",
  },
} as const

type TransferStatus = keyof typeof STATUS_CONFIG

interface Setting {
  id: string
  category: string
  value: string
}

export default function TransfersPage() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [device, setDevice] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)

  const [departments, setDepartments] = useState<Setting[]>([])
  const [locations, setLocations] = useState<Setting[]>([])
  const [wards, setWards] = useState<Setting[]>([])

  const [toDepartment, setToDepartment] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [toWard, setToWard] = useState("")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<TransferStatus>("PENDING")
  const [submitting, setSubmitting] = useState(false)

  // ─── Load dropdown data ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [deptRes, wardRes] = await Promise.all([
        fetch("/api/settings?category=department"),
        fetch("/api/settings?category=ward"),
      ])
      setDepartments(await deptRes.json())
      setWards(await wardRes.json())
    }
    load()
  }, [])

  // Load locations when department changes (cascading)
  useEffect(() => {
    if (!toDepartment) {
      setLocations([])
      setToLocation("")
      return
    }
    async function load() {
      const res = await fetch(`/api/settings?category=location:${toDepartment}`)
      const data = await res.json()
      setLocations(data)
      setToLocation("")
    }
    load()
  }, [toDepartment])

  // ─── Actions ────────────────────────────────────────────────────────────
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

  async function submitTransfer(finalStatus: TransferStatus = status) {
    if (!device || !toDepartment || !toLocation) {
      toast.error("Please complete all required fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/devices/${device.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toDepartment,
          toLocation,
          toWard: toWard || null,
          notes,
          status: finalStatus,
        }),
      })
      if (res.ok) {
        toast.success(
          finalStatus === "COMPLETED"
            ? "✅ Transfer completed and device moved!"
            : `Transfer saved as ${STATUS_CONFIG[finalStatus].label}`
        )
        resetForm()
      } else {
        toast.error("Failed to save transfer")
      }
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setDevice(null)
    setSearch("")
    setToDepartment("")
    setToLocation("")
    setToWard("")
    setNotes("")
    setStatus("PENDING")
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Device</h1>
        <p className="text-muted-foreground">
          Move equipment between departments, locations, or wards
        </p>
      </div>

      {/* ─── Step Indicator ────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 py-2">
        <StepDot number={1} label="Find Device" active={!device} done={!!device} />
        <div className={cn("h-0.5 w-12", device ? "bg-emerald-500" : "bg-slate-300")} />
        <StepDot number={2} label="Destination" active={!!device && !toLocation} done={!!toLocation} />
        <div className={cn("h-0.5 w-12", toLocation ? "bg-emerald-500" : "bg-slate-300")} />
        <StepDot number={3} label="Confirm" active={!!toLocation} done={false} />
      </div>

      {/* ─── STEP 1: Search Device ─────────────────────────────────────── */}
      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
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
            <Button onClick={searchDevice} disabled={searching} className="h-11 px-6">
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {device && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900 border border-blue-200 dark:border-blue-800">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-300" />
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

      {/* ─── STEP 2: Destination ───────────────────────────────────────── */}
      {device && (
        <Card className="border-l-4 border-l-purple-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold">
                2
              </span>
              Choose Destination
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-3">
            {/* To Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-500" />
                To Department <span className="text-red-500">*</span>
              </label>
              <Autocomplete
                value={toDepartment}
                onChange={setToDepartment}
                category="department"
                placeholder="e.g., Radiology"
                color="bg-purple-500"
                required
              />
            </div>

            {/* To Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                To Location <span className="text-red-500">*</span>
              </label>
              <Autocomplete
                value={toLocation}
                onChange={setToLocation}
                category={toDepartment ? `location:${toDepartment}` : "location"}
                placeholder={toDepartment ? "e.g., Room 204" : "Pick department first"}
                color="bg-blue-500"
                required
                disabled={!toDepartment}
              />
            </div>

            {/* To Ward */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-purple-500" />
                To Ward <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <Autocomplete
                value={toWard}
                onChange={setToWard}
                category="ward"
                placeholder="e.g., Ward 3B"
                color="bg-emerald-500"
              />
            </div>

            {/* Preview Route */}
            {toDepartment && toLocation && (
              <div className="md:col-span-3 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-white dark:bg-slate-900">
                    {device.department}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-purple-500" />
                  <Badge className="bg-purple-500 hover:bg-purple-600">
                    {toDepartment}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline" className="bg-white dark:bg-slate-900">
                    {toLocation}
                  </Badge>
                  {toWard && (
                    <>
                      <ArrowRight className="h-4 w-4 text-emerald-500" />
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        {toWard}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── STEP 3: Status & Notes ────────────────────────────────────── */}
      {device && toLocation && (
        <Card className="border-l-4 border-l-emerald-500 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                3
              </span>
              Set Status & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Status Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Transfer Status</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as TransferStatus[]).map((key) => {
                  const cfg = STATUS_CONFIG[key]
                  const Icon = cfg.icon
                  const selected = status === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatus(key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                        "hover:scale-105 active:scale-95",
                        selected
                          ? `${cfg.color} border-current shadow-md scale-105`
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", key === "IN_PROGRESS" && selected && "animate-spin")} />
                      <span className="text-sm font-medium">{cfg.label}</span>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for transfer, condition of the device, special instructions..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <Button
                onClick={() => submitTransfer("COMPLETED")}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Complete Transfer
              </Button>

              <Button
                onClick={() => submitTransfer("IN_PROGRESS")}
                disabled={submitting}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 h-11 px-6"
              >
                <Clock className="h-4 w-4 mr-2" />
                Save as In Progress
              </Button>

              <Button
                onClick={() => submitTransfer("DIFFICULTY")}
                disabled={submitting}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50 h-11 px-6"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark Difficulty
              </Button>

              <Button
                onClick={resetForm}
                disabled={submitting}
                variant="ghost"
                className="h-11 ml-auto"
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

// ─── Helper: Step Indicator ─────────────────────────────────────────────
function StepDot({
  number,
  label,
  active,
  done,
}: {
  number: number
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all",
          done
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-primary text-white ring-4 ring-primary/20"
              : "bg-slate-200 text-slate-500 dark:bg-slate-800"
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : number}
      </div>
      <span
        className={cn(
          "text-sm font-medium hidden sm:inline",
          active || done ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  )
}
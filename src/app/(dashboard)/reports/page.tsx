// src/app/(dashboard)/reports/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  FileText, Download, Loader2, Printer, Pencil, Check, X as XIcon,
  Search, Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Autocomplete } from "@/components/ui/autocomplete"

// ─── Column definitions per report type ─────────────────────────────
const REPORT_COLUMNS: Record<string, { key: string; label: string; editable?: boolean; width?: string }[]> = {
  inventory: [
    { key: "assetTag", label: "Asset Tag", width: "w-28" },
    { key: "name", label: "Device Name", editable: true, width: "w-48" },
    { key: "type", label: "Type", width: "w-24" },
    { key: "brand", label: "Brand", editable: true, width: "w-32" },
    { key: "model", label: "Model", editable: true, width: "w-32" },
    { key: "serialNumber", label: "Serial No.", editable: true, width: "w-32" },
    { key: "department", label: "Department", editable: true, width: "w-36" },
    { key: "location", label: "Location", editable: true, width: "w-40" },
    { key: "ward", label: "Ward", editable: true, width: "w-28" },
    { key: "processor", label: "Processor", editable: true, width: "w-36" },
    { key: "generation", label: "Generation", editable: true, width: "w-24" },
    { key: "remarks", label: "Condition", width: "w-28" },
  ],
  incidents: [
    { key: "createdAt", label: "Date", width: "w-28" },
    { key: "device", label: "Device", width: "w-44" },
    { key: "remarks", label: "Type", editable: true, width: "w-24" },
    { key: "department", label: "Department", editable: true, width: "w-32" },
    { key: "location", label: "Location", editable: true, width: "w-36" },
    { key: "ward", label: "Ward", editable: true, width: "w-24" },
    { key: "notes", label: "Notes", editable: true, width: "w-64" },
    { key: "status", label: "Status", editable: true, width: "w-28" },
    { key: "reportedBy", label: "Reported By", width: "w-32" },
  ],
  maintenance: [
    { key: "createdAt", label: "Date", width: "w-28" },
    { key: "device", label: "Device", width: "w-44" },
    { key: "department", label: "Department", editable: true, width: "w-32" },
    { key: "location", label: "Location", editable: true, width: "w-36" },
    { key: "notes", label: "Work Done", editable: true, width: "w-64" },
    { key: "remarks", label: "Remarks", editable: true, width: "w-40" },
    { key: "cost", label: "Cost", editable: true, width: "w-24" },
    { key: "performedBy", label: "By", width: "w-32" },
  ],
  transfers: [
    { key: "createdAt", label: "Date", width: "w-28" },
    { key: "device", label: "Device", width: "w-44" },
    { key: "fromDepartment", label: "From Dept", width: "w-32" },
    { key: "toDepartment", label: "To Dept", editable: true, width: "w-32" },
    { key: "fromLocation", label: "From Loc", width: "w-36" },
    { key: "toLocation", label: "To Loc", editable: true, width: "w-36" },
    { key: "toWard", label: "To Ward", editable: true, width: "w-24" },
    { key: "notes", label: "Notes", editable: true, width: "w-56" },
    { key: "status", label: "Status", editable: true, width: "w-28" },
  ],
}

const REPORT_LABELS: Record<string, string> = {
  inventory: "Inventory Report",
  incidents: "Incident Report",
  maintenance: "Maintenance Report",
  transfers: "Transfer Report",
}

// ─── Color helpers ──────────────────────────────────────────────────
const CONDITION_STYLES: Record<string, string> = {
  WORKING: "bg-emerald-100 text-emerald-700",
  SPOILT: "bg-amber-100 text-amber-700",
  STOLEN: "bg-red-100 text-red-700",
  LOST: "bg-orange-100 text-orange-700",
  UNDER_REPAIR: "bg-blue-100 text-blue-700",
  DECOMMISSIONED: "bg-slate-100 text-slate-700",
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  DIFFICULTY: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-red-100 text-red-700",
  OPEN: "bg-red-100 text-red-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("inventory")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [department, setDepartment] = useState("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [search, setSearch] = useState("")

  // Inline editing
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)

  async function generateReport() {
    setLoading(true)
    setHasRun(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(from && { from }),
        ...(to && { to }),
        ...(department && { department }),
      })
      const res = await fetch(`/api/reports?${params}`)
      const json = await res.json()
      setData(json.data ?? [])
      if ((json.data ?? []).length === 0) {
        toast.info("No records match your filters")
      } else {
        toast.success(`Generated: ${json.data.length} records`)
      }
    } catch {
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  function startEdit(row: any, field: string, currentValue: any) {
    setEditingCell({ id: row.id, field })
    // Format for editing
    if (field === "device") {
      setEditValue(row.device?.name ?? "")
    } else {
      setEditValue(currentValue ?? "")
    }
  }

  async function saveEdit(row: any, field: string) {
    if (!editingCell) return
    setSaving(true)
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          id: editingCell.id,
          field,
          value: editValue,
        }),
      })
      if (res.ok) {
        // Update local state so UI reflects change immediately
        setData((prev) =>
          prev.map((r) =>
            r.id === editingCell.id ? { ...r, [field]: editValue } : r
          )
        )
        toast.success("Saved", { duration: 1200 })
      } else {
        const err = await res.json()
        toast.error(err.error ?? "Failed to save")
      }
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
      setEditingCell(null)
      setEditValue("")
    }
  }

  function cancelEdit() {
    setEditingCell(null)
    setEditValue("")
  }

  function handleKeyDown(e: React.KeyboardEvent, row: any, field: string) {
    if (e.key === "Enter") { e.preventDefault(); saveEdit(row, field) }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit() }
  }

  function exportCSV() {
    if (data.length === 0) return
    const cols = REPORT_COLUMNS[reportType]
    const headers = cols.map((c) => c.label).join(",")
    const rows = data.map((row) =>
      cols.map((c) => {
        let v = c.key === "device" ? row.device?.name ?? "" : row[c.key]
        if (c.key === "createdAt" && v) v = new Date(v).toLocaleString()
        v = v ?? ""
        return `"${String(v).replace(/"/g, '""')}"`
      }).join(",")
    ).join("\n")

    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV downloaded")
  }

  function printReport() {
    window.print()
  }

  // Filtered view for display
  const filtered = data.filter((row) => {
    if (!search) return true
    const s = search.toLowerCase()
    return Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(s)) ||
      row.device?.name?.toLowerCase().includes(s)
  })

  const cols = REPORT_COLUMNS[reportType]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate, edit, and export reports. Click any cell to edit inline.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-l-4 border-l-primary shadow-sm print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(v) => setReportType(v ?? "inventory")}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="incidents">Incident Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Report</SelectItem>
                  <SelectItem value="transfers">Transfer Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Autocomplete
                value={department}
                onChange={setDepartment}
                category="department"
                placeholder="All departments"
                color="bg-purple-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button onClick={generateReport} disabled={loading} className="h-10 px-6">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            {data.length > 0 && (
              <>
                <Button variant="outline" onClick={exportCSV} className="h-10">
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
                <Button variant="outline" onClick={printReport} className="h-10">
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasRun && data.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 print:pb-0">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg">
                {REPORT_LABELS[reportType]} — {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </CardTitle>
              <Badge variant="outline" className="gap-1">
                <Pencil className="h-3 w-3" /> Click any highlighted cell to edit
              </Badge>
            </div>
            <div className="relative w-64 print:hidden">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9"
                spellCheck={false}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 border-y">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground w-8">#</th>
                    {cols.map((c) => (
                      <th key={c.key} className={cn("text-left p-3 text-xs font-semibold text-muted-foreground", c.width)}>
                        <div className="flex items-center gap-1.5">
                          {c.label}
                          {c.editable && <Pencil className="h-2.5 w-2.5 opacity-40" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="p-3 text-xs text-muted-foreground">{i + 1}</td>
                      {cols.map((col) => {
                        const isEditing = editingCell?.id === row.id && editingCell?.field === col.key
                        const rawValue = col.key === "device" ? row.device?.name ?? "—" : row[col.key]
                        const displayValue = formatCellValue(col.key, rawValue)

                        return (
                          <td key={col.key} className="p-2 align-top">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, row, col.key)}
                                  onBlur={() => saveEdit(row, col.key)}
                                  disabled={saving}
                                  className="h-8 text-sm"
                                  spellCheck={true}
                                />
                                {saving ? (
                                  <Loader2 className="h-4 w-4 animate-spin shrink-0 text-primary" />
                                ) : (
                                  <>
                                    <button
                                      onMouseDown={(e) => { e.preventDefault(); saveEdit(row, col.key) }}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onMouseDown={(e) => { e.preventDefault(); cancelEdit() }}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <XIcon className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div
                                onClick={() => col.editable && startEdit(row, col.key, rawValue)}
                                className={cn(
                                  "px-2 py-1.5 rounded min-h-[32px] flex items-center",
                                  col.editable && "cursor-pointer hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 transition-all group",
                                )}
                              >
                                {renderCellValue(col.key, rawValue, col.editable)}
                                {col.editable && (
                                  <Pencil className="h-3 w-3 ml-auto text-primary opacity-0 group-hover:opacity-60 transition-opacity" />
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {hasRun && data.length === 0 && !loading && (
        <Card>
          <CardContent className="py-20 text-center">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No records found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting the date range or department filter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pre-generate hint */}
      {!hasRun && (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-primary/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Ready to generate</h3>
            <p className="text-sm text-muted-foreground">
              Pick a report type and click <strong>Generate Report</strong> to see the data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Cell formatting ────────────────────────────────────────────────
function formatCellValue(key: string, value: any): string {
  if (value === null || value === undefined) return ""
  if (key === "createdAt" && value) return new Date(value).toLocaleString()
  if (typeof value === "number" && key === "cost") return value.toFixed(2)
  return String(value)
}

function renderCellValue(key: string, value: any, editable?: boolean) {
  const display = formatCellValue(key, value)

  if (!display) {
    return <span className="text-xs text-muted-foreground italic">{editable ? "Click to add" : "—"}</span>
  }

  // Condition badges
  if (key === "remarks" && CONDITION_STYLES[value]) {
    return <Badge className={cn("text-[11px]", CONDITION_STYLES[value])}>{value.replace("_", " ")}</Badge>
  }

  // Status badges
  if (key === "status" && STATUS_STYLES[value]) {
    return <Badge className={cn("text-[11px]", STATUS_STYLES[value])}>{String(value).replace("_", " ")}</Badge>
  }

  // Cost formatting
  if (key === "cost" && value !== null && value !== undefined) {
    return <span className="font-mono text-xs">GHS {Number(value).toFixed(2)}</span>
  }

  return <span className="text-sm">{display}</span>
}
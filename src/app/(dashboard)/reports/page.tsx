// src/app/(dashboard)/reports/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FileText, Download, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ReportsPage() {
  const [reportType, setReportType] = useState("inventory")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [department, setDepartment] = useState("")
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      type: reportType,
      ...(from && { from }), ...(to && { to }), ...(department && { department }),
    })
    const res = await fetch(`/api/reports?${params}`)
    setData(await res.json())
    setLoading(false)
  }

  const exportCSV = () => {
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(","),
      ...data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export equipment reports</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle>Report Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(v) => setReportType(v ?? "inventory")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Inventory Summary</SelectItem>
                  <SelectItem value="incidents">Incident Report</SelectItem>
                  <SelectItem value="maintenance">Maintenance Report</SelectItem>
                  <SelectItem value="transfers">Transfer Log</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="All departments" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={generateReport} disabled={loading}>
              <BarChart3 className="mr-2 h-4 w-4" /> {loading ? "Generating..." : "Generate Report"}
            </Button>
            {data.length > 0 && (
              <Button variant="outline" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Results ({data.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(data[0]).slice(0, 8).map((key) => (
                      <th key={key} className="text-left p-2 font-medium text-muted-foreground">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      {Object.keys(row).slice(0, 8).map((key) => (
                        <td key={key} className="p-2">
                          {typeof row[key] === "boolean" ? (row[key] ? "Yes" : "No") : String(row[key] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
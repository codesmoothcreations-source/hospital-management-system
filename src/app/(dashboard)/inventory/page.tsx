// src/app/(dashboard)/inventory/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Building2, MapPin, TrendingUp } from "lucide-react"

interface DepartmentStats {
  total: number
  working: number
  spoilt: number
  items: {
    id: string
    name: string
    location: string
    ward: string | null
    type: string
    remarks: string
  }[]
}

interface InventoryDevice {
  id: string
  department: string
  name: string
  location: string
  ward: string | null
  type: string
  remarks: string
}

export default async function InventoryPage() {
  const devices: InventoryDevice[] = await prisma.device.findMany({
    orderBy: [{ department: "asc" }, { type: "asc" }],
  })

  const byDepartment = devices.reduce<Record<string, DepartmentStats>>(
    (acc: Record<string, DepartmentStats>, d: InventoryDevice) => {
      if (!acc[d.department]) {
        acc[d.department] = { total: 0, working: 0, spoilt: 0, items: [] }
      }
      acc[d.department].total++
      if (d.remarks === "WORKING") acc[d.department].working++
      if (d.remarks === "SPOILT") acc[d.department].spoilt++
      acc[d.department].items.push({
        id: d.id,
        name: d.name,
        location: d.location,
        ward: d.ward,
        type: d.type,
        remarks: d.remarks,
      })
      return acc
    },
    {}
  )

  const totalDevices = devices.length
  const totalWorking = devices.filter((d) => d.remarks === "WORKING").length
  const totalSpoilt = devices.filter((d) => d.remarks === "SPOILT").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Complete equipment inventory by department</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Package className="h-6 w-6 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Devices</p><p className="text-3xl font-bold">{totalDevices}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100"><TrendingUp className="h-6 w-6 text-emerald-600" /></div>
            <div><p className="text-sm text-muted-foreground">Working</p><p className="text-3xl font-bold">{totalWorking}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100"><Package className="h-6 w-6 text-red-600" /></div>
            <div><p className="text-sm text-muted-foreground">Spoilt</p><p className="text-3xl font-bold">{totalSpoilt}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <div className="space-y-4">
        {Object.entries(byDepartment).map(([dept, data]) => (
          <Card key={dept}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Building2 className="h-5 w-5" /> {dept}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{data.total} total</Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">{data.working} working</Badge>
                  {data.spoilt > 0 && <Badge variant="destructive">{data.spoilt} spoilt</Badge>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.location}
                        {item.ward && ` • Ward: ${item.ward}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      <Badge className={
                        item.remarks === "WORKING" ? "bg-emerald-100 text-emerald-700" :
                        item.remarks === "SPOILT" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-700"
                      }>{item.remarks}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
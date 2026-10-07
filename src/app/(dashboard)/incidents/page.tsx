// src/app/(dashboard)/incidents/page.tsx
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle, Plus, Building, MapPin, BedDouble, User, Calendar,
  CheckCircle2, Clock, Loader2, XCircle, PackageOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { color: string; icon: any; label: string }> = {
  OPEN: {
    color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300",
    icon: AlertTriangle,
    label: "Open",
  },
  IN_PROGRESS: {
    color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
    icon: Loader2,
    label: "In Progress",
  },
  RESOLVED: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: CheckCircle2,
    label: "Resolved",
  },
  CLOSED: {
    color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
    icon: XCircle,
    label: "Closed",
  },
}

const TYPE_STYLES: Record<string, string> = {
  SPOILT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  STOLEN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  LOST: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
}

export default async function IncidentsPage() {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      device: {
        select: {
          name: true,
          assetTag: true,
          type: true,
          department: true,
          location: true,
        },
      },
    },
  })

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "OPEN").length,
    inProgress: incidents.filter((i) => i.status === "IN_PROGRESS").length,
    resolved: incidents.filter((i) => i.status === "RESOLVED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            Track spoilt, stolen, and lost equipment
          </p>
        </div>
        <Button
          render={<Link href="/incidents/new" />}
          className="bg-red-600 hover:bg-red-700 text-white h-11 px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={AlertTriangle} color="text-slate-600" bg="bg-slate-100 dark:bg-slate-800" />
        <StatCard label="Open" value={stats.open} icon={AlertTriangle} color="text-red-600" bg="bg-red-100 dark:bg-red-900/30" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader2} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-900/30" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/30" />
      </div>

      {/* List */}
      {incidents.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No incidents reported</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Everything is running smoothly. Keep up the good work!
            </p>
            <Button render={<Link href="/incidents/new" />} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Report First Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const statusCfg = STATUS_STYLES[incident.status] ?? STATUS_STYLES.OPEN
            const StatusIcon = statusCfg.icon
            return (
              <Card
                key={incident.id}
                className="hover:shadow-md transition-all hover:border-red-200 dark:hover:border-red-900/50"
              >
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left side: content */}
                    <div className="flex-1 space-y-3 min-w-[280px]">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">{incident.device.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            {incident.device.assetTag}
                          </p>
                        </div>
                        <Badge className={cn("ml-2 border", TYPE_STYLES[incident.remarks ?? ""] ?? "bg-slate-100 text-slate-700")}>
                          {incident.remarks ?? "UNKNOWN"}
                        </Badge>
                      </div>

                      <p className="text-sm text-foreground/80 italic border-l-2 border-red-200 dark:border-red-800 pl-3">
                        "{incident.notes}"
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {incident.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </span>
                        {incident.ward && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3" />
                            {incident.ward}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: status + meta */}
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={cn("gap-1.5 border px-3 py-1", statusCfg.color)}>
                        <StatusIcon className={cn("h-3.5 w-3.5", incident.status === "IN_PROGRESS" && "animate-spin")} />
                        {statusCfg.label}
                      </Badge>
                      <div className="text-right text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1 justify-end">
                          <User className="h-3 w-3" /> {incident.reportedBy}
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: number
  icon: any
  color: string
  bg: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
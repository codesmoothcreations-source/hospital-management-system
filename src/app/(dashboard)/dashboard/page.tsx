// src/app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/prisma"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { DeviceTypeChart } from "@/components/dashboard/device-type-chart"
import { DepartmentChart } from "@/components/dashboard/department-chart"
import { RecentIncidents } from "@/components/dashboard/recent-incidents"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Monitor, CheckCircle, AlertTriangle, ArrowRightLeft } from "lucide-react"

export default async function DashboardPage() {
  const [
    totalDevices,
    workingCount,
    spoiltCount,
    transferredCount,
    byType,
    byDepartment,
    recentIncidents,
    recentActivities,
  ] = await Promise.all([
    prisma.device.count(),
    prisma.device.count({ where: { remarks: "WORKING" } }),
    prisma.device.count({ where: { remarks: "SPOILT" } }),
    prisma.device.count({ where: { status: "TRANSFERRED" } }),
    prisma.device.groupBy({ by: ["type"], _count: true }),
    prisma.device.groupBy({ by: ["department"], _count: true }),
    prisma.incident.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { device: true },
    }),
    prisma.activity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, device: { select: { name: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your IT equipment inventory</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Devices" value={totalDevices} icon={Monitor} trend="+12%" />
        <KpiCard title="Working" value={workingCount} icon={CheckCircle} trend="+5%" />
        <KpiCard title="Spoilt" value={spoiltCount} icon={AlertTriangle} trend="-2%" variant="warning" />
        <KpiCard title="Transferred" value={transferredCount} icon={ArrowRightLeft} trend="+8%" variant="info" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DeviceTypeChart data={byType} />
        <DepartmentChart data={byDepartment} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentIncidents incidents={recentIncidents} />
        <ActivityFeed activities={recentActivities} />
      </div>
    </div>
  )
}
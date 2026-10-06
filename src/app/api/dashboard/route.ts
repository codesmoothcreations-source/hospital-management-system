// src/app/api/dashboard/route.ts — FIXED
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [
    totalDevices,
    byType,
    byCondition,
    byDepartment,
    recentIncidents,
    recentTransfers,
    recentActivities,
  ] = await Promise.all([
    prisma.device.count(),
    prisma.device.groupBy({ by: ["type"], _count: true }),
    prisma.device.groupBy({ by: ["remarks"], _count: true }),
    prisma.device.groupBy({ by: ["department"], _count: true }),
    prisma.incident.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { device: { select: { name: true, assetTag: true } } },
    }),
    prisma.transfer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { device: { select: { name: true, assetTag: true } } },
    }),
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ])

  // ✅ Typed correctly
  const spoiltCount = byCondition.find((c: { remarks: string; _count: number }) => c.remarks === "SPOILT")?._count ?? 0
  const stolenCount = byCondition.find((c: { remarks: string; _count: number }) => c.remarks === "STOLEN")?._count ?? 0
  const transferredCount = byCondition.find((c: { remarks: string; _count: number }) => c.remarks === "TRANSFERRED")?._count ?? 0

  return NextResponse.json({
    totalDevices,
    spoiltCount,
    stolenCount,
    transferredCount,
    byType: byType.map((t: { type: string; _count: number }) => ({ type: t.type, count: t._count })),
    byDepartment: byDepartment.map((d: { department: string; _count: number }) => ({ department: d.department, count: d._count })),
    recentIncidents,
    recentTransfers,
    recentActivities,
  })
}
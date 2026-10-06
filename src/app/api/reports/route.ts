// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = req.nextUrl.searchParams
  const reportType = params.get("type") || "inventory"
  const from = params.get("from")
  const to = params.get("to")
  const department = params.get("department")

  const dateFilter: any = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) dateFilter.lte = new Date(to)

  let data: any

  switch (reportType) {
    case "inventory":
      data = await prisma.device.findMany({
        where: department ? { department } : {},
        orderBy: [{ department: "asc" }, { type: "asc" }],
      })
      break
    case "incidents":
      data = await prisma.incident.findMany({
        where: { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined },
        include: { device: true },
        orderBy: { createdAt: "desc" },
      })
      break
    case "maintenance":
      data = await prisma.maintenanceLog.findMany({
        where: { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined },
        include: { device: true },
        orderBy: { createdAt: "desc" },
      })
      break
    case "transfers":
      data = await prisma.transfer.findMany({
        where: { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined },
        include: { device: true },
        orderBy: { createdAt: "desc" },
      })
      break
    default:
      data = []
  }

  return NextResponse.json(data)
}


// Report types: Inventory summary, Incident report, 
// Maintenance report, Transfer log, Department-wise breakdown, Ward-wise breakdown.
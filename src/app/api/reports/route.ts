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
  if (to) dateFilter.lte = new Date(to + "T23:59:59")

  let data: any[] = []

  switch (reportType) {
    case "inventory":
      data = await prisma.device.findMany({
        where: department ? { department } : {},
        orderBy: [{ department: "asc" }, { type: "asc" }],
      })
      break
    case "incidents":
      data = await prisma.incident.findMany({
        where: {
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
          ...(department && { department }),
        },
        include: { device: { select: { name: true, assetTag: true } } },
        orderBy: { createdAt: "desc" },
      })
      break
    case "maintenance":
      data = await prisma.maintenanceLog.findMany({
        where: {
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
          ...(department && { department }),
        },
        include: { device: { select: { name: true, assetTag: true } } },
        orderBy: { createdAt: "desc" },
      })
      break
    case "transfers":
      data = await prisma.transfer.findMany({
        where: {
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
          ...(department && { fromDepartment: department }),
        },
        include: { device: { select: { name: true, assetTag: true } } },
        orderBy: { createdAt: "desc" },
      })
      break
  }

  return NextResponse.json({ type: reportType, count: data.length, data })
}

// PATCH — edit individual record fields
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { type, id, field, value } = body

  if (!type || !id || !field) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Whitelist editable fields per report type
  const EDITABLE: Record<string, string[]> = {
    inventory: ["name", "brand", "model", "serialNumber", "department", "location", "ward", "description", "processor", "generation"],
    incidents: ["notes", "remarks", "status", "department", "location", "ward"],
    maintenance: ["notes", "remarks", "cost", "department", "location"],
    transfers: ["notes", "toDepartment", "toLocation", "toWard", "status"],
  }

  if (!EDITABLE[type]?.includes(field)) {
    return NextResponse.json({ error: "Field not editable" }, { status: 400 })
  }

  // Build the update payload
  const data: any = { [field]: value === "" ? null : value }
  if (field === "cost") data[field] = value ? parseFloat(value) : null

  let updated: any
  switch (type) {
    case "inventory":
      updated = await prisma.device.update({ where: { id }, data })
      break
    case "incidents":
      updated = await prisma.incident.update({ where: { id }, data })
      break
    case "maintenance":
      updated = await prisma.maintenanceLog.update({ where: { id }, data })
      break
    case "transfers":
      updated = await prisma.transfer.update({ where: { id }, data })
      break
  }

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      action: "REPORT_EDITED",
      details: `Edited ${type} report — field "${field}" changed to "${value}"`,
    },
  })

  return NextResponse.json({ success: true, updated })
}
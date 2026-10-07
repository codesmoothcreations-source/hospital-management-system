// src/app/api/incidents/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const status = req.nextUrl.searchParams.get("status")
  const where = status ? { status: status as any } : {}

  const incidents = await prisma.incident.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      device: { select: { name: true, assetTag: true, type: true, department: true, location: true } },
    },
  })

  return NextResponse.json(incidents)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { deviceId, department, location, ward, notes, remarks } = body

  if (!deviceId || !notes || !remarks) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const incident = await prisma.incident.create({
    data: {
      deviceId,
      department,
      location,
      ward: ward || null,
      notes,
      remarks,
      reportedBy: (session.user as any).name ?? "Unknown",
      status: "OPEN",
    },
  })

  // Update device condition based on incident type
  if (remarks === "SPOILT" || remarks === "STOLEN" || remarks === "LOST") {
    await prisma.device.update({
      where: { id: deviceId },
      data: { remarks: remarks as any },
    })
  }

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      deviceId,
      action: "INCIDENT_REPORTED",
      details: `${remarks} incident: ${notes}`,
    },
  })

  return NextResponse.json(incident, { status: 201 })
}
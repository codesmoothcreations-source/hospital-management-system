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
      device: { select: { name: true, assetTag: true, type: true } },
    },
  })

  return NextResponse.json(incidents)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const incident = await prisma.incident.create({
    data: {
      deviceId: body.deviceId,
      department: body.department,
      location: body.location,
      ward: body.ward,
      notes: body.notes,
      remarks: body.remarks,
      reportedBy: (session.user as any).name,
    },
  })

  // Update device condition
  if (body.remarks === "SPOILT" || body.remarks === "STOLEN" || body.remarks === "LOST") {
    await prisma.device.update({
      where: { id: body.deviceId },
      data: { remarks: body.remarks },
    })
  }

  return NextResponse.json(incident, { status: 201 })
}
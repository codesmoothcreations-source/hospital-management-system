// src/app/api/maintenance/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  const log = await prisma.maintenanceLog.create({
    data: {
      deviceId: body.deviceId,
      department: body.department,
      location: body.location,
      notes: body.notes,
      remarks: body.remarks,
      performedBy: (session.user as any).name,
      cost: body.cost ? parseFloat(body.cost) : null,
    },
  })

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      deviceId: body.deviceId,
      action: "MAINTENANCE_LOGGED",
      details: `Maintenance: ${body.notes}`,
    },
  })

  return NextResponse.json(log, { status: 201 })
}
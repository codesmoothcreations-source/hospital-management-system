// src/app/api/incidents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const incident = await prisma.incident.update({
    where: { id },
    data: {
      status: body.status,
      resolvedBy: body.status === "RESOLVED" || body.status === "CLOSED"
        ? (session.user as any).name ?? "Unknown"
        : null,
      resolvedAt: body.status === "RESOLVED" || body.status === "CLOSED"
        ? new Date()
        : null,
    },
  })

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      deviceId: incident.deviceId,
      action: "INCIDENT_UPDATED",
      details: `Incident status: ${body.status}`,
    },
  })

  return NextResponse.json(incident)
}
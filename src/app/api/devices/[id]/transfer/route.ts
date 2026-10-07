// src/app/api/devices/[id]/transfer/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { toDepartment, toLocation, toWard, notes, status } = body

  const device = await prisma.device.findUnique({ where: { id } })
  if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 })

  const transfer = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const t = await tx.transfer.create({
      data: {
        deviceId: id,
        fromDepartment: device.department,
        toDepartment,
        fromLocation: device.location,
        toLocation,
        toWard: toWard || null,
        transferredBy: (session.user as any).name ?? "Unknown",
        notes,
        status: status ?? "PENDING",
      },
    })

    // Only update the device's location if the transfer is completed
    if (status === "COMPLETED") {
      await tx.device.update({
        where: { id },
        data: {
          department: toDepartment,
          location: toLocation,
          ward: toWard || device.ward,
          status: "TRANSFERRED",
        },
      })
    }

    await tx.activity.create({
      data: {
        userId: (session.user as any).id,
        deviceId: id,
        action: "DEVICE_TRANSFERRED",
        details: `Transfer ${status ?? "PENDING"}: ${device.name} → ${toDepartment} / ${toLocation}`,
      },
    })

    return t
  })

  return NextResponse.json(transfer, { status: 201 })
}

// NEW: Update transfer status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const transfer = await prisma.transfer.findFirst({
    where: { deviceId: id },
    orderBy: { createdAt: "desc" },
  })

  if (!transfer) return NextResponse.json({ error: "Transfer not found" }, { status: 404 })

  const updated = await prisma.transfer.update({
    where: { id: transfer.id },
    data: { status: body.status },
  })

  // If marking as completed, move the device
  if (body.status === "COMPLETED") {
    await prisma.device.update({
      where: { id },
      data: {
        department: transfer.toDepartment,
        location: transfer.toLocation,
        ward: transfer.toWard || undefined,
        status: "TRANSFERRED",
      },
    })
  }

  return NextResponse.json(updated)
}
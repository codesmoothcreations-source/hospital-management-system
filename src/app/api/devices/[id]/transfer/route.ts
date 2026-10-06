// src/app/api/devices/[id]/transfer/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import type { Prisma } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const device = await prisma.device.findUnique({ where: { id: params.id } })
  if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 })

  const transfer = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const t = await tx.transfer.create({
      data: {
        deviceId: params.id,
        fromDepartment: device.department,
        toDepartment: body.toDepartment,
        fromLocation: device.location,
        toLocation: body.toLocation,
        toWard: body.toWard || null,
        transferredBy: (session.user as any).name,
        notes: body.notes,
      },
    })

    await tx.device.update({
      where: { id: params.id },
      data: {
        department: body.toDepartment,
        location: body.toLocation,
        ward: body.toWard || device.ward,
        status: "TRANSFERRED",
      },
    })

    await tx.activity.create({
      data: {
        userId: (session.user as any).id,
        deviceId: params.id,
        action: "DEVICE_TRANSFERRED",
        details: `Transferred ${device.name} from ${device.department} to ${body.toDepartment}`,
      },
    })

    return t
  })

  return NextResponse.json(transfer, { status: 201 })
}
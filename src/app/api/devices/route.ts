// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { deviceSchema } from "@/lib/validators"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  const search = searchParams.get("search") || ""
  const type = searchParams.get("type") || ""
  const status = searchParams.get("status") || ""
  const department = searchParams.get("department") || ""

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { serialNumber: { contains: search, mode: "insensitive" } },
      { assetTag: { contains: search, mode: "insensitive" } },
    ]
  }
  if (type) where.type = type
  if (status) where.remarks = status
  if (department) where.department = department

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { transfers: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.device.count({ where }),
  ])

  return NextResponse.json({ devices, total, page, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["ADMIN", "IT_MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const validated = deviceSchema.parse(body)

  // Generate asset tag
  const count = await prisma.device.count()
  const assetTag = `HIT-${String(count + 1).padStart(5, "0")}`

  const device = await prisma.device.create({
    data: { ...validated, assetTag },
  })

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      deviceId: device.id,
      action: "DEVICE_CREATED",
      details: `Added ${device.name} (${device.assetTag})`,
    },
  })

  return NextResponse.json(device, { status: 201 })
}
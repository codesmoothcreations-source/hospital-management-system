// src/app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const params = req.nextUrl.searchParams
  const page = parseInt(params.get("page") || "1")
  const limit = parseInt(params.get("limit") || "30")
  const userId = params.get("userId")
  const action = params.get("action")
  const search = params.get("search")
  const from = params.get("from")
  const to = params.get("to")

  const where: any = {}
  if (userId && userId !== "all") where.userId = userId
  if (action && action !== "all") where.action = action
  if (search) {
    where.OR = [
      { details: { contains: search, mode: "insensitive" } },
      { action: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ]
  }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to + "T23:59:59")
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, role: true } },
        device: { select: { name: true, assetTag: true } },
      },
    }),
    prisma.activity.count({ where }),
  ])

  return NextResponse.json({
    activities,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
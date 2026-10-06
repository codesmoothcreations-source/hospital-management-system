// src/app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20")
  const userId = req.nextUrl.searchParams.get("userId")
  const action = req.nextUrl.searchParams.get("action")

  const where: any = {}
  if (userId) where.userId = userId
  if (action) where.action = action

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

  return NextResponse.json({ activities, total, page, totalPages: Math.ceil(total / limit) })
}
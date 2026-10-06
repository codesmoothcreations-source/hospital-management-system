// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const category = req.nextUrl.searchParams.get("category")
  const settings = category
    ? await prisma.setting.findMany({ where: { category }, orderBy: { value: "asc" } })
    : await prisma.setting.findMany({ orderBy: [{ category: "asc" }, { value: "asc" }] })

  return NextResponse.json(settings)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const setting = await prisma.setting.create({
    data: { category: body.category, value: body.value },
  })

  return NextResponse.json(setting, { status: 201 })
}

// Settings categories: department, location, ward, brand, 
// processor, generation, device_type, remarks.
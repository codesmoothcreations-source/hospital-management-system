// src/app/api/settings/suggestions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public-ish endpoint: returns all settings grouped by category
// Used to warm the client cache on app load
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category")

  const settings = category
    ? await prisma.setting.findMany({
        where: { category },
        orderBy: { value: "asc" },
        select: { id: true, category: true, value: true },
      })
    : await prisma.setting.findMany({
        orderBy: [{ category: "asc" }, { value: "asc" }],
        select: { id: true, category: true, value: true },
      })

  return NextResponse.json(settings, {
    headers: {
      // Cache for 30s on the client, 5min on CDN
      "Cache-Control": "public, max-age=30, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
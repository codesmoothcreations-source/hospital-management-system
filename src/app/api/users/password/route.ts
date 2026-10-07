// src/app/api/users/password/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return NextResponse.json({ error: "Wrong current password" }, { status: 400 })

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  await prisma.activity.create({
    data: {
      userId: user.id,
      action: "PASSWORD_CHANGED",
      details: `Changed own password`,
    },
  })

  return NextResponse.json({ success: true })
}
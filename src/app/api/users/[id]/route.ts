// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

// Update user (role, active, name)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.role && { role: body.role }),
      ...(typeof body.isActive === "boolean" && { isActive: body.isActive }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      action: body.isActive === false ? "USER_BLOCKED" : body.isActive === true ? "USER_UNBLOCKED" : "USER_UPDATED",
      details: `Updated user ${updated.name} (${updated.email})`,
    },
  })

  return NextResponse.json(updated)
}

// Reset password (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  if (!body.newPassword || body.newPassword.length < 4) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(body.newPassword, 10)
  const user = await prisma.user.update({
    where: { id },
    data: { password: hashed },
    select: { name: true, email: true },
  })

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      action: "PASSWORD_RESET",
      details: `Reset password for ${user.name} (${user.email})`,
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  if (id === (session.user as any).id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
  }

  const user = await prisma.user.delete({
    where: { id },
    select: { name: true, email: true },
  })

  await prisma.activity.create({
    data: {
      userId: (session.user as any).id,
      action: "USER_DELETED",
      details: `Deleted user ${user.name} (${user.email})`,
    },
  })

  return NextResponse.json({ success: true })
}
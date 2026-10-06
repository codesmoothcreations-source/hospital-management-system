// src/app/(dashboard)/devices/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { DeviceDetail } from "@/components/devices/device-detail"

export default async function DeviceDetailPage({ params }: { params: { id: string } }) {
  const device = await prisma.device.findUnique({
    where: { id: params.id },
    include: {
      transfers: { orderBy: { createdAt: "desc" } },
      incidents: { orderBy: { createdAt: "desc" } },
      maintenanceLogs: { orderBy: { createdAt: "desc" } },
      routineChecks: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, include: { user: true } },
    },
  })

  if (!device) notFound()

  return <DeviceDetail device={device} />
}
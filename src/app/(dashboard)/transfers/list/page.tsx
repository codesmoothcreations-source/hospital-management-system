// src/app/(dashboard)/transfers/list/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Building, MapPin, BedDouble, User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  DIFFICULTY: "bg-orange-100 text-orange-700 border-orange-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
}

export default async function TransferListPage() {
  const transfers = await prisma.transfer.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { device: { select: { name: true, assetTag: true, type: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer History</h1>
        <p className="text-muted-foreground">All device movement records</p>
      </div>

      {transfers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No transfers recorded yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold">{t.device.name}</p>
                      <span className="text-xs font-mono text-muted-foreground">
                        {t.device.assetTag}
                      </span>
                      <Badge className={cn("border", STATUS_STYLES[t.status])}>
                        {t.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <Building className="h-3 w-3" />
                        {t.fromDepartment}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <Badge className="bg-purple-500 hover:bg-purple-600 gap-1">
                        <Building className="h-3 w-3" />
                        {t.toDepartment}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {t.fromLocation} → {t.toLocation}
                      </span>
                      {t.toWard && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3" /> {t.toWard}
                        </span>
                      )}
                    </div>

                    {t.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        "{t.notes}"
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1 justify-end">
                      <User className="h-3 w-3" /> {t.transferredBy}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
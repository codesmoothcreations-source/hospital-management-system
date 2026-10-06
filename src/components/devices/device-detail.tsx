// src/components/devices/device-detail.tsx
"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, AlertTriangle, Wrench, Clock, MapPin, Building } from "lucide-react"

const conditionColors = {
  WORKING: "bg-emerald-100 text-emerald-700",
  SPOILT: "bg-red-100 text-red-700",
  STOLEN: "bg-amber-100 text-amber-700",
  LOST: "bg-slate-100 text-slate-700",
  UNDER_REPAIR: "bg-blue-100 text-blue-700",
}

export function DeviceDetail({ device }: { device: any }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{device.name}</h1>
            <Badge className={conditionColors[device.remarks as keyof typeof conditionColors]}>
              {device.remarks}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono mt-1">{device.assetTag}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfers">Transfers ({device.transfers.length})</TabsTrigger>
          <TabsTrigger value="incidents">Incidents ({device.incidents.length})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance ({device.maintenanceLogs.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Device Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Type" value={device.type} />
                <InfoRow label="Brand" value={device.brand} />
                <InfoRow label="Model" value={device.model} />
                <InfoRow label="Serial Number" value={device.serialNumber} mono />
                <InfoRow label="Embossment" value={device.embossmentNumber} mono />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Processor" value={device.processor} />
                <InfoRow label="Generation" value={device.generation} />
                <InfoRow label="Description" value={device.description} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Department" value={device.department} icon={Building} />
                <InfoRow label="Location" value={device.location} icon={MapPin} />
                <InfoRow label="Ward" value={device.ward} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {device.transfers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No transfers recorded</p>
              ) : (
                <div className="space-y-4">
                  {device.transfers.map((t: any) => (
                    <div key={t.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="p-2 rounded-lg bg-primary/10 h-fit">
                        <ArrowRightLeft className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {t.fromDepartment} → {t.toDepartment}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t.fromLocation} → {t.toLocation}
                          {t.toWard && ` (Ward: ${t.toWard})`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(t.createdAt).toLocaleDateString()} • {t.transferredBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar TabsContent for incidents, maintenance, activity */}
      </Tabs>
    </div>
  )
}

function InfoRow({ label, value, mono, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </span>
    </div>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface Incident {
  id: string
  device: { name: string; assetTag: string } | null
  department: string
  location: string
  remarks: string | null
}

export function RecentIncidents({ incidents }: { incidents: Incident[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> Recent Incidents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent incidents</p>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{incident.device?.name}</p>
                  <p className="text-xs text-muted-foreground">{incident.department} • {incident.location}</p>
                </div>
                <Badge variant={incident.remarks === "STOLEN" ? "destructive" : "secondary"}>
                  {incident.remarks}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
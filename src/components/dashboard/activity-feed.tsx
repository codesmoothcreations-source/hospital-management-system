import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  user: { name: string } | null
  details: string | null
  action: string
  createdAt: Date
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex gap-3 py-2 border-b last:border-0">
                <div className="p-1.5 rounded-full bg-primary/10 h-fit mt-0.5">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{a.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{a.details || a.action}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
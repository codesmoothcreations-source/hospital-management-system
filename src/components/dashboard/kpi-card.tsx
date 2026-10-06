// src/components/dashboard/kpi-card.tsx
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: string
  variant?: "default" | "warning" | "info" | "success"
}

export function KpiCard({ title, value, icon: Icon, trend, variant = "default" }: KpiCardProps) {
  const variants = {
    default: "text-primary bg-primary/10",
    warning: "text-amber-600 bg-amber-100 dark:bg-amber-900/20",
    info: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    success: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.startsWith("+") ? "text-emerald-600" : "text-red-600"
              )}>
                {trend} from last month
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", variants[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
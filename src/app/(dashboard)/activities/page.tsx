// src/app/(dashboard)/activities/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Activity as ActivityIcon, Search, LogIn, UserPlus, UserMinus,
  Package, ArrowRightLeft, AlertTriangle, Wrench, KeyRound,
  Settings as SettingsIcon, ChevronLeft, ChevronRight, Loader2,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Action config ────────────────────────────────────────────────
const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string; dot: string }> = {
  LOGIN:              { label: "Login",             icon: LogIn,           color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",       dot: "bg-blue-500" },
  LOGOUT:             { label: "Logout",            icon: LogIn,           color: "bg-slate-100 text-slate-700 border-slate-300",                                          dot: "bg-slate-500" },
  USER_CREATED:       { label: "User Created",      icon: UserPlus,        color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500" },
  USER_BLOCKED:       { label: "User Blocked",      icon: UserMinus,       color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300",           dot: "bg-red-500" },
  USER_UNBLOCKED:     { label: "User Unblocked",    icon: UserPlus,        color: "bg-emerald-100 text-emerald-700 border-emerald-300",                                    dot: "bg-emerald-500" },
  USER_UPDATED:       { label: "User Updated",      icon: UserPlus,        color: "bg-blue-100 text-blue-700 border-blue-300",                                              dot: "bg-blue-500" },
  USER_DELETED:       { label: "User Deleted",      icon: UserMinus,       color: "bg-red-100 text-red-700 border-red-300",                                                dot: "bg-red-500" },
  PASSWORD_CHANGED:   { label: "Password Changed",  icon: KeyRound,        color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-500" },
  PASSWORD_RESET:     { label: "Password Reset",    icon: KeyRound,        color: "bg-amber-100 text-amber-700 border-amber-300",                                          dot: "bg-amber-500" },
  DEVICE_CREATED:     { label: "Device Added",      icon: Package,         color: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300", dot: "bg-purple-500" },
  DEVICE_UPDATED:     { label: "Device Updated",    icon: Package,         color: "bg-blue-100 text-blue-700 border-blue-300",                                              dot: "bg-blue-500" },
  DEVICE_TRANSFERRED: { label: "Device Transferred",icon: ArrowRightLeft,  color: "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300", dot: "bg-indigo-500" },
  DEVICE_DELETED:     { label: "Device Deleted",    icon: Package,         color: "bg-red-100 text-red-700 border-red-300",                                                dot: "bg-red-500" },
  INCIDENT_REPORTED:  { label: "Incident Reported", icon: AlertTriangle,   color: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300", dot: "bg-orange-500" },
  INCIDENT_UPDATED:   { label: "Incident Updated",  icon: AlertTriangle,   color: "bg-amber-100 text-amber-700 border-amber-300",                                          dot: "bg-amber-500" },
  MAINTENANCE_LOGGED: { label: "Maintenance",       icon: Wrench,          color: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300",      dot: "bg-cyan-500" },
  SETTINGS_UPDATED:   { label: "Settings Updated",  icon: SettingsIcon,    color: "bg-slate-100 text-slate-700 border-slate-300",                                          dot: "bg-slate-500" },
}

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] ?? {
    label: action.replace(/_/g, " "),
    icon: ActivityIcon,
    color: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
  }
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  IT_MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  TECHNICIAN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  VIEWER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [userId, setUserId] = useState("all")
  const [action, setAction] = useState("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Load users once for the filter dropdown
  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {})
  }, [])

  // Load activities on filter change
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: "30",
      ...(search && { search }),
      ...(userId !== "all" && { userId }),
      ...(action !== "all" && { action }),
      ...(from && { from }),
      ...(to && { to }),
    })
    fetch(`/api/activities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.activities ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
      })
      .finally(() => setLoading(false))
  }, [page, search, userId, action, from, to])

  function resetFilters() {
    setSearch(""); setUserId("all"); setAction("all"); setFrom(""); setTo(""); setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ActivityIcon className="h-8 w-8 text-primary" />
            Activity Log
          </h1>
          <p className="text-muted-foreground">
            Complete audit trail of every action in the system
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-11"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Total Events" value={total} />
        <MiniStat label="Users" value={users.length} />
        <MiniStat label="This Page" value={activities.length} />
        <MiniStat label="Page" value={`${page} / ${totalPages}`} />
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-l-4 border-l-blue-500 animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by action, details, or user name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-10 h-10"
                />
              </div>
              <Select value={userId} onValueChange={(v) => { setUserId(v ?? "all"); setPage(1) }}>
                <SelectTrigger className="h-10"><SelectValue placeholder="All users" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} — {u.role.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={action} onValueChange={(v) => { setAction(v ?? "all"); setPage(1) }}>
                <SelectTrigger className="h-10"><SelectValue placeholder="All actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.keys(ACTION_CONFIG).map((k) => (
                    <SelectItem key={k} value={k}>{ACTION_CONFIG[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
                <Input
                  type="date"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setPage(1) }}
                  className="h-10"
                  placeholder="From date"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setPage(1) }}
                  className="h-10"
                  placeholder="To date"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Loading activity...</p>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <ActivityIcon className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No activity found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => {
            const cfg = getActionConfig(a.action)
            const Icon = cfg.icon
            return (
              <Card
                key={a.id}
                className="hover:shadow-sm transition-shadow border-l-4"
                style={{ borderLeftColor: cfg.dot.replace("bg-", "").includes("red") ? "#ef4444" : undefined }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn("p-2.5 rounded-xl shrink-0 border", cfg.color)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className={cn("border", cfg.color)}>{cfg.label}</Badge>
                        <span className="text-sm font-medium text-foreground">
                          {a.user?.name ?? "Unknown User"}
                        </span>
                        {a.user?.role && (
                          <Badge className={cn("text-[10px] px-1.5", ROLE_STYLES[a.user.role])}>
                            {a.user.role.replace("_", " ")}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-foreground/80 break-words">
                        {a.details ?? "No details"}
                      </p>

                      {a.device && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Device: {a.device.name} ({a.device.assetTag})
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <p className="font-medium">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                      <p>{new Date(a.createdAt).toLocaleTimeString()}</p>
                      {a.ipAddress && (
                        <p className="font-mono mt-1 opacity-70">{a.ipAddress}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} — {total} total events
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
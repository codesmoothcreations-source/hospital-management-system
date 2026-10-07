// src/components/layout/sidebar.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Monitor, ArrowRightLeft, AlertTriangle, Activity, Package,
  Wrench, FileText, Users, Settings, ChevronLeft, ChevronRight, List,
  Shield
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/devices", label: "Devices", icon: Monitor },
  { href: "/transfers", label: "Transfers", icon: ArrowRightLeft },
  { href: "/transfers/list", label: "Transfer History", icon: List },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
    { href: "/activities", label: "Activity Log", icon: Activity },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/users", label: "Users", icon: Shield, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
]

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  )

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-white dark:bg-slate-900 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b">
        <Monitor className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-3 font-semibold text-lg">Hospital ITMS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t text-slate-400 hover:text-slate-600"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
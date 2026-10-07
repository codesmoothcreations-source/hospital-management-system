// src/app/(dashboard)/layout.tsx
import { SettingsPrefetcher } from "@/components/providers/prefetch"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")   // ← change to session?.user

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={(session.user as any).role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar user={session.user} />
        <SettingsPrefetcher />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
// src/app/(dashboard)/users/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users as UsersIcon, UserPlus, Ban, KeyRound, CheckCircle2, Shield,
  Trash2, Search, Activity, Loader2, UserCheck, Mail,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ADMIN:      { label: "Admin",      color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300",           icon: Shield },
  IT_MANAGER: { label: "IT Manager", color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",     icon: UserCheck },
  TECHNICIAN: { label: "Technician", color: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300", icon: UserCheck },
  VIEWER:     { label: "Viewer",     color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",   icon: UsersIcon },
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Add user dialog
  const [openAdd, setOpenAdd] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER" })
  const [saving, setSaving] = useState(false)

  // Reset password dialog
  const [resetFor, setResetFor] = useState<any>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetting, setResetting] = useState(false)

  // Edit role dialog
  const [editFor, setEditFor] = useState<any>(null)
  const [editRole, setEditRole] = useState("")

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      setUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function addUser() {
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`✅ User created: ${data.name}`)
        setOpenAdd(false)
        setForm({ name: "", email: "", password: "", role: "VIEWER" })
        loadUsers()
      } else {
        toast.error(data.error ?? "Failed to create user")
      }
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(user: any) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    if (res.ok) {
      toast.success(user.isActive ? "User blocked" : "User unblocked")
      loadUsers()
    }
  }

  async function updateRole() {
    if (!editFor) return
    const res = await fetch(`/api/users/${editFor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: editRole }),
    })
    if (res.ok) {
      toast.success("Role updated")
      setEditFor(null)
      loadUsers()
    }
  }

  async function resetPassword() {
    if (!resetFor || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters")
      return
    }
    setResetting(true)
    try {
      const res = await fetch(`/api/users/${resetFor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      if (res.ok) {
        toast.success(`Password reset for ${resetFor.name}`)
        setResetFor(null)
        setNewPassword("")
      } else {
        toast.error("Failed to reset password")
      }
    } finally {
      setResetting(false)
    }
  }

  async function deleteUser(user: any) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
    const data = await res.json()
    if (res.ok) {
      toast.success("User deleted")
      loadUsers()
    } else {
      toast.error(data.error ?? "Failed to delete")
    }
  }

  const filtered = users.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    blocked: users.filter((u) => !u.isActive).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Add users, assign roles, and control access
          </p>
        </div>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger render={<Button className="h-11 px-6" />}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Create New User
              </DialogTitle>
              <DialogDescription>
                Add a new user to the system and assign a role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="user@hospital.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Password</label>
                <Input
                  type="text"
                  placeholder="At least 4 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The user can change this after first login
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? "VIEWER" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(ROLE_CONFIG).map((r) => (
                      <SelectItem key={r} value={r}>
                        <div className="flex items-center gap-2">
                          {ROLE_CONFIG[r].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addUser} disabled={saving} className="w-full h-11">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Total Users" value={stats.total} icon={UsersIcon} color="text-primary bg-primary/10" />
        <StatBox label="Active" value={stats.active} icon={CheckCircle2} color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" />
        <StatBox label="Admins" value={stats.admins} icon={Shield} color="text-red-600 bg-red-100 dark:bg-red-900/30" />
        <StatBox label="Blocked" value={stats.blocked} icon={Ban} color="text-slate-600 bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Users Grid */}
      {loading ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UsersIcon className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => {
            const roleCfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.VIEWER
            const RoleIcon = roleCfg.icon
            return (
              <Card
                key={user.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  !user.isActive && "opacity-60"
                )}
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0",
                      "bg-gradient-to-br from-primary to-primary/70 text-white"
                    )}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                    {!user.isActive && (
                      <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                    )}
                  </div>

                  {/* Role badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn("border gap-1.5", roleCfg.color)}>
                      <RoleIcon className="h-3 w-3" />
                      {roleCfg.label}
                    </Badge>
                    {user.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                        <Ban className="h-3 w-3" />
                        Blocked
                      </Badge>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-muted-foreground space-y-1 mb-4 pt-3 border-t">
                    <p className="flex items-center gap-1.5">
                      <Activity className="h-3 w-3" />
                      {user._count?.activities ?? 0} actions logged
                    </p>
                    <p>
                      Last login:{" "}
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => { setEditFor(user); setEditRole(user.role) }}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Role
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8"
                      onClick={() => setResetFor(user)}
                    >
                      <KeyRound className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant={user.isActive ? "outline" : "default"}
                      className={cn(
                        "flex-1 text-xs h-8",
                        user.isActive && "text-red-600 hover:bg-red-50 hover:text-red-700"
                      )}
                      onClick={() => toggleActive(user)}
                    >
                      {user.isActive ? (
                        <><Ban className="h-3 w-3 mr-1" /> Block</>
                      ) : (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Unblock</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 text-red-600 hover:bg-red-50"
                      onClick={() => deleteUser(user)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reset Password Dialog */}
      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {resetFor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              type="text"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={resetPassword} disabled={resetting} className="w-full">
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editFor} onOpenChange={(o) => !o && setEditFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Change Role
            </DialogTitle>
            <DialogDescription>
              Update role for {editFor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Select value={editRole} onValueChange={(v) => setEditRole(v ?? "VIEWER")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(ROLE_CONFIG).map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_CONFIG[r].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={updateRole} className="w-full">Save Role</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
// src/app/(dashboard)/users/page.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Shield, Ban, Key } from "lucide-react"
import { toast } from "sonner"

const roleColors = {
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/30",
  IT_MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  TECHNICIAN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
  VIEWER: "bg-slate-100 text-slate-700 dark:bg-slate-800",
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER" })

  const fetchUsers = async () => {
    const res = await fetch("/api/users")
    setUsers(await res.json())
  }

  useEffect(() => { fetchUsers() }, [])

  const addUser = async () => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success("User added")
      setOpen(false)
      setForm({ name: "", email: "", password: "", role: "VIEWER" })
      fetchUsers()
    }
  }

  const toggleBlock = async (id: string, isActive: boolean) => {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    toast.success(isActive ? "User blocked" : "User unblocked")
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? "VIEWER" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ADMIN","IT_MANAGER","TECHNICIAN","VIEWER"].map((r) => (
                    <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addUser} className="w-full">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toggleBlock(user.id, user.isActive)}>
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
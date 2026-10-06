// src/app/(dashboard)/settings/password/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Key, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirm, setConfirm] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    const res = await fetch("/api/users/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    })
    if (res.ok) {
      toast.success("Password changed successfully")
      setCurrent(""); setNewPass(""); setConfirm("")
    } else {
      toast.error("Current password is incorrect")
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Change Password</h1>
        <p className="text-muted-foreground">Update your account password</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" /> Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
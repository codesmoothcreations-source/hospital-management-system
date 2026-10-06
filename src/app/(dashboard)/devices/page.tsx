// src/app/(dashboard)/devices/page.tsx
"use client"
import { useState, useEffect } from "react"
import { DataTable } from "@/components/devices/data-table"
import { columns } from "@/components/devices/columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      ...(search && { search }),
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
    })
    fetch(`/api/devices?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setDevices(data.devices)
        setLoading(false)
      })
  }, [page, search, typeFilter, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Devices</h1>
          <p className="text-muted-foreground">Manage all IT equipment</p>
        </div>
        <Button render={<Link href="/devices/new" />}>
            <Plus className="mr-2 h-4 w-4" /> Add Device
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={devices}
        loading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
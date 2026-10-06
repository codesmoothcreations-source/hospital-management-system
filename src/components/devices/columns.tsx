// src/components/devices/columns.tsx
"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const conditionColors = {
  WORKING: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
  SPOILT: "bg-red-100 text-red-700 dark:bg-red-900/30",
  STOLEN: "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
  LOST: "bg-slate-100 text-slate-700 dark:bg-slate-800",
  UNDER_REPAIR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
}

export const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: "assetTag",
    header: "Asset Tag",
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("assetTag")}</span>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Device <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>,
  },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "ward", header: "Ward" },
  {
    accessorKey: "remarks",
    header: "Condition",
    cell: ({ row }) => {
      const status = row.getValue("remarks") as string
      return (
        <Badge className={conditionColors[status as keyof typeof conditionColors]}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
            <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <a href={`/devices/${row.original.id}`}>
              <Eye className="mr-2 h-4 w-4" /> View
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <a href={`/devices/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
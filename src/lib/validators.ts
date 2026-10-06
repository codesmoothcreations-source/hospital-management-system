// src/lib/validators.ts
import { z } from "zod"

export const deviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  type: z.enum([
    "DESKTOP", "LAPTOP", "TABLET", "PRINTER", "ROUTER", "SWITCH",
    "SERVER", "CCTV", "TELEPHONE", "UPS", "WIRELESS_TRANSMITTER",
    "MONITOR", "KEYBOARD", "MOUSE", "OTHER",
  ]),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  embossmentNumber: z.string().optional().nullable(),
  processor: z.string().optional().nullable(),
  generation: z.string().optional().nullable(),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  ward: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  remarks: z.enum([
    "WORKING", "SPOILT", "STOLEN", "LOST", "UNDER_REPAIR", "DECOMMISSIONED",
  ]).default("WORKING"),
})

export const transferSchema = z.object({
  toDepartment: z.string().min(1),
  toLocation: z.string().min(1),
  toWard: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const incidentSchema = z.object({
  deviceId: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  ward: z.string().optional().nullable(),
  notes: z.string().min(1),
  remarks: z.enum(["SPOILT", "STOLEN", "LOST"]),
})

export const maintenanceSchema = z.object({
  deviceId: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  notes: z.string().min(1),
  remarks: z.string().optional().nullable(),
  cost: z.coerce.number().optional().nullable(),
})
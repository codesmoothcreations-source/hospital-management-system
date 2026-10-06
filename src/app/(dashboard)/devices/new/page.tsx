// src/app/(dashboard)/devices/new/page.tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const deviceSchema = z.object({
  name: z.string().min(1, "Device name is required"),
  type: z.string().min(1, "Type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  embossmentNumber: z.string().optional(),
  processor: z.string().optional(),
  generation: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  ward: z.string().optional(),
  description: z.string().optional(),
  remarks: z.string().default("WORKING"),
})

type DeviceFormData = z.infer<typeof deviceSchema>

export default function NewDevicePage() {
  const router = useRouter()
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: { remarks: "WORKING" },
  })

  const onSubmit = async (data: DeviceFormData) => {
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success("Device added successfully")
      router.push("/devices")
    } else {
      toast.error("Failed to add device")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Device</h1>
        <p className="text-muted-foreground">Register a new IT equipment</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Name *</label>
              <Input {...form.register("name")} placeholder="e.g., Dell OptiPlex 7090" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Type *</label>
              <Select onValueChange={(v) => form.setValue("type", v as string)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {["DESKTOP","LAPTOP","TABLET","PRINTER","ROUTER","SWITCH","SERVER","CCTV","TELEPHONE","UPS","WIRELESS_TRANSMITTER","MONITOR","KEYBOARD","MOUSE","OTHER"].map((t) => (
                    <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand *</label>
              <Input {...form.register("brand")} placeholder="e.g., Dell, HP, Lenovo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input {...form.register("model")} placeholder="e.g., OptiPlex 7090" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Identification</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Serial Number</label>
              <Input {...form.register("serialNumber")} placeholder="e.g., SN-12345678" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Embossment Number</label>
              <Input {...form.register("embossmentNumber")} placeholder="e.g., EMB-9876" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Processor</label>
              <Input {...form.register("processor")} placeholder="e.g., Intel Core i7-12700" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Generation</label>
              <Input {...form.register("generation")} placeholder="e.g., 12th Gen" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Location & Assignment</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department *</label>
              <Input {...form.register("department")} placeholder="e.g., Radiology" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input {...form.register("location")} placeholder="e.g., 2nd Floor, Room 204" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward</label>
              <Input {...form.register("ward")} placeholder="e.g., Ward 3B" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select onValueChange={(v) => form.setValue("remarks", v ?? "WORKING")} defaultValue="WORKING">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["WORKING","SPOILT","STOLEN","LOST","UNDER_REPAIR"].map((r) => (
                    <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea {...form.register("description")} placeholder="Any additional notes..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Save Device</Button>
        </div>
      </form>
    </div>
  )
}
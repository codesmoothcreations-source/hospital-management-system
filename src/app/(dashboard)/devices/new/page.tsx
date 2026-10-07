// src/app/(dashboard)/devices/new/page.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Autocomplete } from "@/components/ui/autocomplete";

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
});

type DeviceFormData = z.input<typeof deviceSchema>;

export default function NewDevicePage() {
  const router = useRouter();
  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: "",
      type: "",
      brand: "",
      department: "",
      location: "",
      remarks: "WORKING", // ← default here instead
    },
  });

  const onSubmit = async (data: DeviceFormData) => {
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Device added successfully");
      router.push("/devices");
    } else {
      toast.error("Failed to add device");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Device</h1>
        <p className="text-muted-foreground">Register a new IT equipment</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Name *</label>
              <Input
                {...form.register("name")}
                placeholder="e.g., Dell OptiPlex 7090"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Type *</label>
              <Select onValueChange={(v) => form.setValue("type", v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "DESKTOP",
                    "LAPTOP",
                    "TABLET",
                    "PRINTER",
                    "ROUTER",
                    "SWITCH",
                    "SERVER",
                    "CCTV",
                    "TELEPHONE",
                    "UPS",
                    "WIRELESS_TRANSMITTER",
                    "MONITOR",
                    "KEYBOARD",
                    "MOUSE",
                    "OTHER",
                  ].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand *</label>
              <Autocomplete
                value={form.watch("brand") ?? ""}
                onChange={(v) => form.setValue("brand", v)}
                category="brand"
                placeholder="e.g., Dell, HP, Lenovo"
                color="bg-amber-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input
                {...form.register("model")}
                placeholder="e.g., OptiPlex 7090"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Serial Number</label>
              <Input
                {...form.register("serialNumber")}
                placeholder="e.g., SN-12345678"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Embossment Number</label>
              <Input
                {...form.register("embossmentNumber")}
                placeholder="e.g., EMB-9876"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Processor</label>
              <Autocomplete
                value={form.watch("processor") ?? ""}
                onChange={(v) => form.setValue("processor", v)}
                category="processor"
                placeholder="e.g., Intel Core i7"
                color="bg-red-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Generation</label>
              <Autocomplete
                value={form.watch("generation") ?? ""}
                onChange={(v) => form.setValue("generation", v)}
                category="generation"
                placeholder="e.g., 12th Gen"
                color="bg-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department *</label>
              <Autocomplete
                value={form.watch("department") ?? ""}
                onChange={(v) => form.setValue("department", v)}
                category="department"
                placeholder="e.g., Radiology"
                color="bg-purple-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Autocomplete
                value={form.watch("location") ?? ""}
                onChange={(v) => form.setValue("location", v)}
                category={
                  form.watch("department")
                    ? `location:${form.watch("department")}`
                    : "location"
                }
                placeholder="e.g., 2nd Floor, Room 204"
                color="bg-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ward</label>
              <Autocomplete
                value={form.watch("ward") ?? ""}
                onChange={(v) => form.setValue("ward", v)}
                category="ward"
                placeholder="e.g., Ward 3B"
                color="bg-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select
                onValueChange={(v) => form.setValue("remarks", v ?? "WORKING")}
                defaultValue="WORKING"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["WORKING", "SPOILT", "STOLEN", "LOST", "UNDER_REPAIR"].map(
                    (r) => (
                      <SelectItem key={r} value={r}>
                        {r.replace("_", " ")}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...form.register("description")}
                placeholder="Any additional notes..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save Device</Button>
        </div>
      </form>
    </div>
  );
}

// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@hospital.com";
  const password = "admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Admin already exists:", email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: "System Administrator",
      email,
      password: hashed,
      role: "ADMIN",
      isActive: true,
    },
  });

  // prisma/seed.ts — inside main(), add this:
  const settings = [
    // Departments
    { category: "department", value: "Radiology" },
    { category: "department", value: "Cardiology" },
    { category: "department", value: "Emergency" },
    { category: "department", value: "Pediatrics" },
    { category: "department", value: "Surgery" },
    { category: "department", value: "Laboratory" },
    { category: "department", value: "Pharmacy" },
    { category: "department", value: "Administration" },
    { category: "department", value: "IT Department" },

    // Locations (with department prefix for cascading)
    { category: "location:Radiology", value: "Ground Floor - X-Ray Room" },
    { category: "location:Radiology", value: "Ground Floor - MRI Room" },
    { category: "location:Cardiology", value: "1st Floor - Ward A" },
    { category: "location:Cardiology", value: "1st Floor - Ward B" },
    { category: "location:Emergency", value: "Ground Floor - Triage" },
    { category: "location:Emergency", value: "Ground Floor - Resus" },
    { category: "location:Pediatrics", value: "2nd Floor - Ward 3B" },
    { category: "location:Pediatrics", value: "2nd Floor - Ward 3C" },
    { category: "location:Surgery", value: "1st Floor - Theatre 1" },
    { category: "location:Surgery", value: "1st Floor - Theatre 2" },
    { category: "location:Laboratory", value: "Ground Floor - Lab A" },
    { category: "location:Pharmacy", value: "Ground Floor - Main Pharmacy" },
    { category: "location:Administration", value: "3rd Floor - Admin Office" },
    { category: "location:IT Department", value: "Basement - Server Room" },

    // Wards
    { category: "ward", value: "Ward 1A" },
    { category: "ward", value: "Ward 1B" },
    { category: "ward", value: "Ward 2A" },
    { category: "ward", value: "Ward 2B" },
    { category: "ward", value: "Ward 3A" },
    { category: "ward", value: "Ward 3B" },
    { category: "ward", value: "Ward 3C" },
    { category: "ward", value: "ICU" },
    { category: "ward", value: "NICU" },
    { category: "ward", value: "Maternity" },
    { category: "ward", value: "Theatre Recovery" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { category_value: { category: s.category, value: s.value } },
      update: {},
      create: s,
    });
  }
  console.log("✅ Seeded reference data (departments, locations, wards)");

  console.log("\n✅ Admin created!");
  console.log("   Email:    admin@hospital.com");
  console.log("   Password: admin\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

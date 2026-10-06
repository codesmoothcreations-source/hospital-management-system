// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "admin@hospital.com"
  const password = "admin"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("✅ Admin already exists:", email)
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name: "System Administrator",
      email,
      password: hashed,
      role: "ADMIN",
      isActive: true,
    },
  })

  console.log("\n✅ Admin created!")
  console.log("   Email:    admin@hospital.com")
  console.log("   Password: admin\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
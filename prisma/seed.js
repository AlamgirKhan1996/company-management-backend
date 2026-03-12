// prisma/seed.js
import bcrypt from "bcrypt";
import prisma from "../src/utils/prismaClient.js";

async function main() {
  const email = "admin@example.com";
  const password = "password123";
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({ where: { email } });

  if (existing) {
    console.log("✅ Admin already exists:", existing.email);
    return;
  }

  const company = await prisma.company.create({
    data: {
      name: "Default Company",
      email: "company@example.com",
      phone: "0000000000",
      address: "Default Address",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashed,
      role: "SUPER_ADMIN",
      company: { connect: { id: company.id } },
    },
  });

  console.log("✅ Company created:", company.email);
  console.log("✅ Admin created:", user.email);
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

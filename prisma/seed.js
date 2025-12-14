// prisma/seed.js
import bcrypt from "bcrypt";
import prisma from "../src/utils/prismaClient.js";

async function main() {
  const email = "admin@example.com";
  const password = "password123";
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("✅ Admin already exists:", existing.email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Super Admin",
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

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

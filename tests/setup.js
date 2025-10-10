import prisma from "../src/utils/prismaClient.js";

beforeAll(async () => {
  await prisma.$connect();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.task.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

import prisma from "../src/utils/prismaClient.js";

beforeAll(async () => {
  await prisma.$connect();
});
afterEach(async () => {
  // Delete in order to avoid foreign key constraint errors
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.file.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.project.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

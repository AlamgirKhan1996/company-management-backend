import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
    datasourcesUrl: process.env.DATABASE_URL,
});
export default prisma;

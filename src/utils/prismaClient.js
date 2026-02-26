import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
    datasources: {
        db: process.env.DATABASE_URL,
    },
});
export default prisma;

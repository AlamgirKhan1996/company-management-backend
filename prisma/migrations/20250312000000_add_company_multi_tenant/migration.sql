-- CreateTable: Company
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- Add SUPER_ADMIN to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

-- Insert default company for existing data
INSERT INTO "Company" ("id", "name", "email", "phone", "address", "createdAt")
VALUES (gen_random_uuid(), 'Default Company', 'default@company.local', NULL, NULL, CURRENT_TIMESTAMP);

-- User: add companyId (nullable first), backfill, then set NOT NULL
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

UPDATE "User" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

ALTER TABLE "User" ALTER COLUMN "companyId" SET NOT NULL;

DROP INDEX IF EXISTS "User_email_key";

CREATE UNIQUE INDEX "User_email_companyId_key" ON "User"("email", "companyId");

CREATE INDEX "User_companyId_idx" ON "User"("companyId");

ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Department: add companyId
ALTER TABLE "Department" ADD COLUMN "companyId" TEXT;

UPDATE "Department" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

ALTER TABLE "Department" ALTER COLUMN "companyId" SET NOT NULL;

CREATE INDEX "Department_companyId_idx" ON "Department"("companyId");

ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Project: add companyId
ALTER TABLE "Project" ADD COLUMN "companyId" TEXT;

UPDATE "Project" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

ALTER TABLE "Project" ALTER COLUMN "companyId" SET NOT NULL;

CREATE INDEX "Project_companyId_idx" ON "Project"("companyId");

ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Task: add companyId
ALTER TABLE "Task" ADD COLUMN "companyId" TEXT;

UPDATE "Task" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

ALTER TABLE "Task" ALTER COLUMN "companyId" SET NOT NULL;

CREATE INDEX "Task_companyId_idx" ON "Task"("companyId");

ALTER TABLE "Task" ADD CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Employee: add companyId, then drop unique email and add unique(email, companyId)
ALTER TABLE "Employee" ADD COLUMN "companyId" TEXT;

UPDATE "Employee" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

ALTER TABLE "Employee" ALTER COLUMN "companyId" SET NOT NULL;

DROP INDEX IF EXISTS "Employee_email_key";

CREATE UNIQUE INDEX "Employee_email_companyId_key" ON "Employee"("email", "companyId");

CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- File: add companyId
ALTER TABLE "File" ADD COLUMN "companyId" TEXT;

UPDATE "File" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

ALTER TABLE "File" ALTER COLUMN "companyId" SET NOT NULL;

CREATE INDEX "File_companyId_idx" ON "File"("companyId");

ALTER TABLE "File" ADD CONSTRAINT "File_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ActivityLog: add companyId (nullable)
ALTER TABLE "ActivityLog" ADD COLUMN "companyId" TEXT;

UPDATE "ActivityLog" SET "companyId" = (SELECT "id" FROM "Company" WHERE "email" = 'default@company.local' LIMIT 1);

CREATE INDEX "ActivityLog_companyId_idx" ON "ActivityLog"("companyId");

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

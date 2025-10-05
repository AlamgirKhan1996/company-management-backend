-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "employeeId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "public"."ActivityLog" ADD COLUMN     "details" TEXT,
ADD COLUMN     "entity" TEXT,
ADD COLUMN     "performedById" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

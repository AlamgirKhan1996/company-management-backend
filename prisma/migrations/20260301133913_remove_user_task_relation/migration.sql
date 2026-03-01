/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `Task` table. All the data in the column will be lost.
  - The primary key for the `_DepartmentEmployees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_DepartmentProjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_DepartmentEmployees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_DepartmentProjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedToId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignedToId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "_DepartmentEmployees" DROP CONSTRAINT "_DepartmentEmployees_AB_pkey";

-- AlterTable
ALTER TABLE "_DepartmentProjects" DROP CONSTRAINT "_DepartmentProjects_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentEmployees_AB_unique" ON "_DepartmentEmployees"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentProjects_AB_unique" ON "_DepartmentProjects"("A", "B");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

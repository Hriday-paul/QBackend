/*
  Warnings:

  - Added the required column `category` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('DESIGN', 'SALES', 'MARKETING', 'FINANCE', 'TECHNOLOGY', 'ENGINEERING', 'BUSINESS', 'HUMAN_RESOURCE');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "category" "JobCategory" NOT NULL;

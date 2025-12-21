-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "fees" DECIMAL(10,2),
ADD COLUMN     "payoutAmount" DECIMAL(10,2);

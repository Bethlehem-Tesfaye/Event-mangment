/*
  Warnings:

  - A unique constraint covering the columns `[recovery_token_hash]` on the table `registrations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."registrations" ADD COLUMN     "otp_expires" TIMESTAMP(3),
ADD COLUMN     "otp_hash" TEXT,
ADD COLUMN     "recovery_token_expires" TIMESTAMP(3),
ADD COLUMN     "recovery_token_hash" TEXT,
ADD COLUMN     "recovery_token_used" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redirect_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "registrations_recovery_token_hash_key" ON "public"."registrations"("recovery_token_hash");

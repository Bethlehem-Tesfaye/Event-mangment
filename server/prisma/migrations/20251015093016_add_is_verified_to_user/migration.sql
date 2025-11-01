-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "picture" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

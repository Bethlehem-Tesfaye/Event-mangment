-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

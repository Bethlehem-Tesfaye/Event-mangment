-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "receipt_data" JSONB,
ADD COLUMN     "receipt_ref_id" TEXT;

-- AlterTable
ALTER TABLE "public"."notification" ADD COLUMN     "event_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

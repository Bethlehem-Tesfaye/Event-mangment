-- DropForeignKey
ALTER TABLE "public"."registrations" DROP CONSTRAINT "registrations_user_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

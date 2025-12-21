/*
  Warnings:

  - The primary key for the `event_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."event_categories" DROP CONSTRAINT "event_categories_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_speakers" DROP CONSTRAINT "event_speakers_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."registrations" DROP CONSTRAINT "registrations_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_event_id_fkey";

-- AlterTable
ALTER TABLE "public"."event_categories" DROP CONSTRAINT "pk_event_categories",
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "pk_event_categories" PRIMARY KEY ("event_id", "category_id");

-- AlterTable
ALTER TABLE "public"."event_speakers" ALTER COLUMN "event_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."events" DROP CONSTRAINT "events_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "events_id_seq";

-- AlterTable
ALTER TABLE "public"."registrations" ALTER COLUMN "event_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."tickets" ALTER COLUMN "event_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."event_categories" ADD CONSTRAINT "event_categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."event_speakers" ADD CONSTRAINT "event_speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

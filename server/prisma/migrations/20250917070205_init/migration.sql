-- CreateEnum
CREATE TYPE "public"."event_status_enum" AS ENUM ('draft', 'published', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."location_type_enum" AS ENUM ('online', 'in-person');

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_categories" (
    "event_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "pk_event_categories" PRIMARY KEY ("event_id","category_id")
);

-- CreateTable
CREATE TABLE "public"."event_speakers" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "photo_url" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "event_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "location_type" "public"."location_type_enum",
    "location" VARCHAR(255),
    "status" "public"."event_status_enum" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_datetime" TIMESTAMP(6),
    "end_datetime" TIMESTAMP(6),
    "duration" INTEGER,
    "event_banner_url" VARCHAR(255),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(20),
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "address" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registrations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "ticket_type" INTEGER NOT NULL,
    "registered_quantity" INTEGER NOT NULL DEFAULT 1,
    "registered_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendee_name" TEXT,
    "attendee_email" TEXT,
    "qr_code_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "event_id" INTEGER NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tickets" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "remaining_quantity" INTEGER NOT NULL,
    "max_per_user" INTEGER NOT NULL DEFAULT 1,
    "total_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "refreshTokenHash" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE INDEX "event_speakers_event_id_idx" ON "public"."event_speakers"("event_id");

-- CreateIndex
CREATE INDEX "events_user_id_idx" ON "public"."events"("user_id");

-- CreateIndex
CREATE INDEX "events_title_idx" ON "public"."events"("title");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "public"."events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE INDEX "registrations_event_id_idx" ON "public"."registrations"("event_id");

-- CreateIndex
CREATE INDEX "registrations_user_id_idx" ON "public"."registrations"("user_id");

-- CreateIndex
CREATE INDEX "registrations_ticket_type_idx" ON "public"."registrations"("ticket_type");

-- CreateIndex
CREATE INDEX "tickets_event_id_idx" ON "public"."tickets"("event_id");

-- CreateIndex
CREATE INDEX "tickets_type_idx" ON "public"."tickets"("type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."event_categories" ADD CONSTRAINT "event_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."event_categories" ADD CONSTRAINT "event_categories_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."event_speakers" ADD CONSTRAINT "event_speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_ticket_id_fkey" FOREIGN KEY ("ticket_type") REFERENCES "public"."tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

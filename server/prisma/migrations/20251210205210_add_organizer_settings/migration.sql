-- CreateTable
CREATE TABLE "public"."OrganizerSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapaKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizerSettings_userId_key" ON "public"."OrganizerSettings"("userId");

-- AddForeignKey
ALTER TABLE "public"."OrganizerSettings" ADD CONSTRAINT "OrganizerSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

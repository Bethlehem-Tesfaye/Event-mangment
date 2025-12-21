-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "txRef" TEXT NOT NULL,
    "chapaRefId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phoneNumber" VARCHAR(10),
    "returnUrl" TEXT,
    "callbackUrl" TEXT,
    "customizationTitle" TEXT,
    "customizationDescription" TEXT,
    "metaHideReceipt" BOOLEAN DEFAULT false,
    "metaDisablePhoneEdit" BOOLEAN DEFAULT false,
    "metaCustomReceiptEnabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txRef_key" ON "public"."Payment"("txRef");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

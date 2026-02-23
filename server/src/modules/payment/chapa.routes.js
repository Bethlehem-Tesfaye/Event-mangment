/* eslint-disable camelcase */
/* eslint-disable no-console */
import express from "express";
import axios from "axios";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import prisma from "../../lib/prisma.js";
import logger from "../../utils/logger.js";
import { purchaseTicket } from "../event/event.service.js";
import authMiddleware from "../../middleware/authMiddleware.js";

export const chapaRoutes = express.Router();

chapaRoutes.post("/initialize", authMiddleware, async (req, res, next) => {
  try {
    const {
      eventId,
      ticketId,
      quantity = 1,
      firstName,
      lastName,
      email,
      phoneNumber,
      returnUrl
    } = req.body;

    const userId = req.userId || null;

    // Fetch ticket + event
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId, 10) },
      include: { event: true }
    });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Organizer = event owner
    const organizerId = ticket.event.userId;

    // Fetch organizer's Chapa key
    const organizerSettings = await prisma.organizerSettings.findUnique({
      where: { userId: organizerId }
    });

    if (!organizerSettings?.chapaKey) {
      return res.status(400).json({ message: "Organizer Chapa key not set" });
    }

    const amount = Number(ticket.price) * quantity;

    // Fees
    const feesAmount = Number((amount * 0.025).toFixed(2));
    const organizerAmount = Number((amount - feesAmount).toFixed(2));

    // Transaction reference
    const txRef = crypto.randomUUID();

    const safeReturnUrl =
      returnUrl || `${process.env.CLIENT_URL}/payment/result`;

    const currency = "ETB";

    // Save pending payment
    const payment = await prisma.payment.create({
      data: {
        eventId,
        ticketId: parseInt(ticketId, 10),
        userId: userId || null,
        organizerId,
        quantity,
        amount,
        currency,
        txRef,
        status: "pending",
        firstName,
        lastName,
        email,
        phoneNumber,
        returnUrl,
        fees: feesAmount,
        payoutAmount: organizerAmount
      }
    });

    logger.info("Pending payment saved", {
      paymentId: payment.id,
      txRef,
      amount,
      currency,
      status: payment.status
    });

    // Initialize payment with Chapa TEST endpoint (with debug)
    let chapaResponse;
    try {
      const payload = {
        amount,
        currency,
        tx_ref: txRef,
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        callback_url: `${process.env.LOCAL_BASE_URL}/api/chapa/webhook`,
        return_url: `${safeReturnUrl}?tx_ref=${txRef}`
      };

      const headers = {
        Authorization: `Bearer ${organizerSettings.chapaKey}`, // use organizer key
        "Content-Type": "application/json"
      };

      const authPreview = organizerSettings.chapaKey
        ? `${String(organizerSettings.chapaKey).slice(0, 30)}...`
        : undefined;

      logger.debug("Chapa initialize request", {
        url: "https://api.chapa.co/v1/transaction/initialize",
        payload,
        authPreview // safe preview of key
      });

      chapaResponse = await axios.post(
        "https://api.chapa.co/v1/transaction/initialize",
        payload,
        { headers }
      );

      logger.debug("Chapa initialize response", {
        status: chapaResponse.status,
        data: chapaResponse.data
      });
    } catch (axErr) {
      // log axios details for debugging (avoid referencing undefined locals)
      logger.error("Chapa initialize failed", {
        message: axErr?.message,
        stack: axErr?.stack,
        responseData: axErr?.response?.data,
        responseStatus: axErr?.response?.status,
        requestHeaders: axErr?.config?.headers ?? null,
        requestPayload: axErr?.config?.data ?? null
      });

      return res.status(axErr?.response?.status || 500).json({
        success: false,
        message: axErr?.message,
        details: axErr?.response?.data || null
      });
    }

    return res.status(200).json({
      checkoutUrl: chapaResponse.data?.data?.checkout_url,
      paymentId: payment.id,
      expectedPayout: organizerAmount,
      fees: feesAmount
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

chapaRoutes.get("/result", async (req, res) => {
  try {
    const txRef = req.query.tx_ref;
    if (!txRef) return res.status(400).json({ message: "tx_ref required" });

    const payment = await prisma.payment.findUnique({
      where: { txRef: String(txRef) }
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const organizerSettings = await prisma.organizerSettings.findUnique({
      where: { userId: payment.organizerId }
    });
    if (!organizerSettings?.chapaKey) {
      return res.status(400).json({ message: "Organizer Chapa key not set" });
    }

    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      { headers: { Authorization: `Bearer ${organizerSettings.chapaKey}` } }
    );

    const status = verifyRes?.data?.data?.status;
    const receiptRefId = verifyRes?.data?.data?.ref_id;

    if (status !== "success") {
      return res.status(400).json({
        message: "Payment not successful",
        details: verifyRes?.data
      });
    }

    if (payment.status !== "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "success",
          paidAt: new Date(),
          receiptRefId,
          receiptData: verifyRes?.data || null
        }
      });

      await purchaseTicket(
        {
          eventId: payment.eventId,
          ticketId: payment.ticketId,
          userId: payment.userId,
          attendeeName:
            `${payment.firstName || ""} ${payment.lastName || ""}`.trim(),
          attendeeEmail: payment.email,
          quantity: payment.quantity
        },
        req.app.get("io")
      );
    }

    const registration = await prisma.registration.findFirst({
      where: {
        userId: payment.userId,
        eventId: payment.eventId,
        deletedAt: null
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      success: true,
      registrationId: registration?.id || null,
      receiptRefId
    });
  } catch (err) {
    logger.error("Chapa verify failed", {
      message: err?.message,
      responseData: err?.response?.data,
      responseStatus: err?.response?.status
    });
    return res.status(500).json({ message: "Verification failed" });
  }
});

chapaRoutes.post("/webhook", async (req, res) => {
  try {
    logger.info("Webhook received", {
      tx_ref: req.body.tx_ref,
      status: req.body.status,
      reference: req.body.reference
    });

    const signature = req.headers["x-chapa-signature"];
    if (signature !== process.env.CHAPA_WEBHOOK_SECRET) {
      return res.status(403).send("Invalid signature");
    }

    const { tx_ref, status, reference } = req.body;
    if (!tx_ref) return res.status(400).send("tx_ref missing");

    const payment = await prisma.payment.findUnique({
      where: { txRef: tx_ref }
    });
    if (!payment) return res.status(404).send("Payment not found");

    if (payment.status === "success") {
      return res.status(200).send("Already processed");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status || payment.status,
        chapaRefId: reference,
        receiptRefId: reference,
        paidAt: status === "success" ? new Date() : payment.paidAt
      }
    });

    if (status === "success") {
      await purchaseTicket(
        {
          eventId: updatedPayment.eventId,
          ticketId: updatedPayment.ticketId,
          userId: updatedPayment.userId,
          attendeeName:
            `${updatedPayment.firstName || ""} ${updatedPayment.lastName || ""}`.trim(),
          attendeeEmail: updatedPayment.email,
          quantity: updatedPayment.quantity
        },
        req.app.get("io")
      );
    }

    return res.status(200).send("Webhook processed");
  } catch (err) {
    return res.status(500).send("Error processing webhook");
  }
});

chapaRoutes.get("/receipt", authMiddleware, async (req, res) => {
  try {
    const txRef = req.query.tx_ref;
    if (!txRef) return res.status(400).json({ message: "tx_ref required" });

    const payment = await prisma.payment.findUnique({
      where: { txRef: String(txRef) }
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.receiptData) {
      return res.status(200).json({ success: true, data: payment.receiptData });
    }

    const organizerSettings = await prisma.organizerSettings.findUnique({
      where: { userId: payment.organizerId }
    });
    if (!organizerSettings?.chapaKey) {
      return res.status(400).json({ message: "Organizer Chapa key not set" });
    }

    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      { headers: { Authorization: `Bearer ${organizerSettings.chapaKey}` } }
    );

    await prisma.payment.update({
      where: { id: payment.id },
      data: { receiptData: verifyRes?.data || null }
    });

    return res.status(200).json({ success: true, data: verifyRes?.data });
  } catch (err) {
    return res.status(500).json({ message: "Receipt fetch failed" });
  }
});

// Receipt PDF
chapaRoutes.get("/receipt/pdf", authMiddleware, async (req, res) => {
  try {
    const { tx_ref: txRef } = req.query;
    if (!txRef) return res.status(400).json({ message: "tx_ref required" });

    const payment = await prisma.payment.findUnique({
      where: { txRef: String(txRef) }
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const data = payment.receiptData || {};
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="receipt-${txRef}.pdf"`
    );

    doc.pipe(res);
    doc.fontSize(18).text("Payment Receipt", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Transaction Ref: ${txRef}`);
    doc.text(`Status: ${data?.data?.status || payment.status}`);
    doc.text(`Amount: ${data?.data?.amount || payment.amount}`);
    doc.text(`Currency: ${data?.data?.currency || payment.currency}`);
    doc.text(
      `Reference ID: ${data?.data?.ref_id || payment.receiptRefId || "—"}`
    );
    doc.text(
      `Paid At: ${payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "—"}`
    );
    doc.moveDown();

    doc.text("Customer:");
    doc.text(
      `Name: ${payment.firstName || ""} ${payment.lastName || ""}`.trim()
    );
    doc.text(`Email: ${payment.email || "—"}`);

    doc.end();

    return undefined;
  } catch {
    return res.status(500).json({ message: "Receipt PDF failed" });
  }
});

chapaRoutes.get(
  "/receipt/by-registration/:registrationId",
  authMiddleware,
  async (req, res) => {
    try {
      const { registrationId } = req.params;
      const { userId } = req;

      const registration = await prisma.registration.findUnique({
        where: { id: Number(registrationId) },
        select: { eventId: true }
      });
      if (!registration)
        return res.status(404).json({ message: "Registration not found" });

      const payment = await prisma.payment.findFirst({
        where: {
          userId,
          eventId: registration.eventId,
          status: "success"
        },
        orderBy: { createdAt: "desc" }
      });
      if (!payment)
        return res.status(404).json({ message: "Payment not found" });

      return res.status(200).json({
        success: true,
        txRef: payment.txRef,
        data: payment.receiptData || null
      });
    } catch {
      return res.status(500).json({ message: "Receipt fetch failed" });
    }
  }
);

const handleWebhook = async (req, res) => {
  try {
    const tx_ref = req.body?.tx_ref || req.query?.trx_ref || req.query?.tx_ref;
    const status = req.body?.status || req.query?.status;
    const reference = req.body?.reference || req.query?.ref_id;

    if (!tx_ref) return res.status(400).send("tx_ref missing");

    const payment = await prisma.payment.findUnique({
      where: { txRef: String(tx_ref) }
    });
    if (!payment) return res.status(404).send("Payment not found");

    if (payment.status === "success") {
      return res.status(200).send("Already processed");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status || payment.status,
        chapaRefId: reference,
        receiptRefId: reference,
        paidAt: status === "success" ? new Date() : payment.paidAt
      }
    });

    if (status === "success") {
      await purchaseTicket(
        {
          eventId: updatedPayment.eventId,
          ticketId: updatedPayment.ticketId,
          userId: updatedPayment.userId,
          attendeeName:
            `${updatedPayment.firstName || ""} ${updatedPayment.lastName || ""}`.trim(),
          attendeeEmail: updatedPayment.email,
          quantity: updatedPayment.quantity
        },
        req.app.get("io")
      );
    }

    return res.status(200).send("Webhook processed");
  } catch (err) {
    return res.status(500).send("Error processing webhook");
  }
};

chapaRoutes.get("/webhook", handleWebhook);
chapaRoutes.post("/webhook", handleWebhook);

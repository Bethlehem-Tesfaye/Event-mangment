/* eslint-disable camelcase */
/* eslint-disable no-console */
import express from "express";
import axios from "axios";
import crypto from "crypto";
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
        callback_url: `${process.env.LOCAL_BASE_URL}/api/chapa/callback` // webhook
        // return_url: `${process.env.CLIENT_URL}/payment-success?status=success&receipt=${txRef}`
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
      logger.info("Payment already processed", {
        paymentId: payment.id,
        txRef: tx_ref
      });
      return res.status(200).send("Already processed");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status, chapaRefId: reference }
    });

    logger.info("Payment updated via webhook", {
      paymentId: updatedPayment.id,
      txRef: updatedPayment.txRef,
      status: updatedPayment.status,
      chapaRefId: updatedPayment.chapaRefId
    });

    if (status === "success") {
      try {
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
        logger.info("Tickets issued for payment", {
          paymentId: updatedPayment.id,
          userId: updatedPayment.userId,
          quantity: updatedPayment.quantity
        });
      } catch (issueErr) {
        logger.error("Failed to issue tickets after payment success", {
          paymentId: updatedPayment.id,
          error: issueErr?.message || String(issueErr)
        });
      }
    }

    return res.status(200).send("Webhook processed");
  } catch (err) {
    return res.status(500).send("Error processing webhook");
  }
});

chapaRoutes.get("/callback", async (req, res) => {
  console.log("Callback hit with:", req.query);

  const { trx_ref, tx_ref, status, ref_id } = req.query;
  const reference = trx_ref || tx_ref;

  if (!reference) {
    return res.redirect(`${process.env.CLIENT_URL}/payment-success`);
  }

  const payment = await prisma.payment.findUnique({
    where: { txRef: reference }
  });

  if (!payment) {
    // If payment not found, still redirect user to frontend
    return res.redirect(`${process.env.CLIENT_URL}/payment-success`);
  }

  // Mark success and issue tickets (callback path)
  if (status === "success" && payment.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "success", chapaRefId: ref_id }
    });

    try {
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
      logger.info("Tickets issued via callback", { paymentId: payment.id });
    } catch (issueErr) {
      logger.error("Failed to issue tickets in callback", {
        paymentId: payment.id,
        error: issueErr?.message || String(issueErr)
      });
    }
  }

  return res.redirect(
    `${process.env.CLIENT_URL}/payment-success?status=success&receipt=${ref_id}`
  );
});

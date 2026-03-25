// ticketRecoveryPlugin.js
import { createAuthEndpoint } from "better-auth/plugins";
import crypto, { randomInt } from "crypto";
import prisma from "../../lib/prisma.js";
import { publishEmailJob } from "../../utils/qstashPublisher.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const verifyOTP = (otp, hash) =>
  hash === crypto.createHash("sha256").update(otp).digest("hex");

export const ticketRecoveryPlugin = () => ({
  id: "ticket-recovery",

  endpoints: {
    startRecovery: createAuthEndpoint("/ticket/view", "GET", async (ctx) => {
      const url = new URL(ctx.request.url);
      const rawToken = url.searchParams.get("token");
      const redirectUrlParam = url.searchParams.get("redirectUrl");

      const cookieHeader =
        ctx.request?.headers?.get("cookie") || ctx.headers?.cookie || "";

      if (!rawToken) return ctx.json({ error: "Invalid or expired link" }, 400);

      const tokenHash = hashToken(rawToken);

      const registration = await prisma.registration.findFirst({
        where: {
          recoveryTokenHash: tokenHash,
          deletedAt: null
        },
        include: { user: true } // fetch user info
      });

      if (!registration)
        return ctx.json({ error: "Invalid or expired link" }, 400);

      let authBase = process.env.AUTH_URL || "http://localhost:4000";
      authBase = authBase.replace(/\/api\/auth\/?$/, "");

      const sessionRes = await fetch(`${authBase}/api/auth/get-session`, {
        headers: { cookie: cookieHeader }
      });

      const sessionData = await sessionRes.json().catch(() => ({}));
      const sessionUserId =
        sessionData?.user?.id ||
        sessionData?.session?.user?.id ||
        sessionData?.session?.userId ||
        null;

      // ✅ Case 1: User has valid session → redirect directly
      if (sessionRes.ok && sessionUserId === registration.userId) {
        return ctx.redirect(
          `${process.env.CLIENT_URL}/registrations/${registration.id}`
        );
      }

      // ✅ Case 2: Real user (not anonymous) with no session → redirect to login
      if (!registration.user.isAnonymous) {
        const target =
          redirectUrlParam ||
          `${process.env.CLIENT_URL}/registrations/${registration.id}`;

        return ctx.redirect(
          `${process.env.CLIENT_URL}/login?redirectUrl=${encodeURIComponent(
            target
          )}`
        );
      }

      // ✅ Case 3: Anonymous user → OTP flow
      const otp = String(randomInt(100000, 999999));
      const otpHash = hashOTP(otp);
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.registration.update({
        where: { id: registration.id },
        data: {
          otpHash,
          otpExpires: expires,
          recoverySourceUserId: registration.userId
        }
      });

      await publishEmailJob({
        type: "otp",
        email: registration.attendeeEmail,
        otp,
        eventId: registration.eventId
      });

      return ctx.redirect(
        `${process.env.CLIENT_URL}/tickets/recover/verify?token=${encodeURIComponent(
          rawToken
        )}`
      );
    }),

    verifyRecoveryOtp: createAuthEndpoint(
      "/ticket/recover/verify",
      "POST",
      async (ctx) => {
        const cookieHeader =
          ctx.request?.headers?.get("cookie") || ctx.headers?.cookie || "";

        const body = ctx.body ?? (await ctx.request.json());
        const { token: rawToken, otp } = body || {};

        if (!rawToken || !otp)
          return ctx.json({ error: "Invalid request" }, 400);

        const tokenHash = hashToken(rawToken);

        const registration = await prisma.registration.findFirst({
          where: {
            recoveryTokenHash: tokenHash,
            deletedAt: null
          },
          include: { user: true }
        });

        if (!registration) return ctx.json({ error: "Invalid link" }, 400);

        // Only allow OTP verification for anonymous users
        if (!registration.user.isAnonymous) {
          return ctx.json(
            {
              error: "Please log in to access your ticket",
              loginRedirect: `${process.env.CLIENT_URL}/login?redirectUrl=${encodeURIComponent(
                `${process.env.CLIENT_URL}/registrations/${registration.id}`
              )}`
            },
            403
          );
        }

        if (
          !registration.otpHash ||
          !registration.otpExpires ||
          registration.otpExpires < new Date()
        ) {
          return ctx.json({ error: "OTP expired" }, 400);
        }

        if (!verifyOTP(otp, registration.otpHash)) {
          return ctx.json({ error: "Invalid OTP" }, 400);
        }

        const oldUserId =
          registration.recoverySourceUserId || registration.userId;

        // Create new anonymous user/session
        let authBase = process.env.AUTH_URL || "http://localhost:4000";
        authBase = authBase.replace(/\/api\/auth\/?$/, "");

        const origin = process.env.CLIENT_URL || "http://localhost:5173";

        const anonRes = await fetch(`${authBase}/api/auth/sign-in/anonymous`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            origin,
            cookie: cookieHeader
          },
          body: "{}"
        });

        const setCookie = anonRes.headers.get("set-cookie");
        if (setCookie && typeof ctx.setHeader === "function") {
          ctx.setHeader("set-cookie", setCookie);
        }

        const anonData = await anonRes.json().catch(() => ({}));

        if (!anonRes.ok || !anonData?.user?.id) {
          return ctx.json(
            {
              error: "Failed to create anonymous session",
              status: anonRes.status,
              message: anonData?.error || anonData?.message || null
            },
            500
          );
        }

        const newUserId = anonData.user.id;

        // Transfer ownership
        await prisma.$transaction([
          prisma.registration.updateMany({
            where: { userId: oldUserId },
            data: { userId: newUserId }
          }),
          prisma.notification.updateMany({
            where: { userId: oldUserId },
            data: { userId: newUserId }
          }),
          prisma.payment.updateMany({
            where: { userId: oldUserId },
            data: { userId: newUserId }
          })
        ]);

        // Clear OTP
        await prisma.registration.update({
          where: { id: registration.id },
          data: {
            otpHash: null,
            otpExpires: null,
            recoverySourceUserId: null
          }
        });

        return ctx.json({
          success: true,
          redirectUrl: `${process.env.CLIENT_URL}/registrations/${registration.id}`
        });
      }
    )
  }
});

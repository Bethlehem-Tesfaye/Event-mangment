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
    // STEP 1: user clicks email link → generate OTP
    startRecovery: createAuthEndpoint("/ticket/recover", "GET", async (ctx) => {
      const url = new URL(ctx.request.url);
      const rawToken = url.searchParams.get("token");
      if (!rawToken) return ctx.json({ error: "Invalid link" }, 400);

      const tokenHash = hashToken(rawToken);

      const registration = await prisma.registration.findFirst({
        where: {
          recoveryTokenHash: tokenHash,
          deletedAt: null
        }
      });

      if (!registration) return ctx.json({ error: "Link invalid" }, 400);

      const otp = String(randomInt(100000, 999999));
      const otpHash = hashOTP(otp);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

      await prisma.registration.update({
        where: { id: registration.id },
        data: {
          otpHash,
          otpExpires: expires
        }
      });

      if (registration.attendeeEmail) {
        await publishEmailJob({
          type: "otp",
          email: registration.attendeeEmail,
          otp,
          eventId: registration.eventId
        });
      }

      return ctx.redirect(
        `${process.env.CLIENT_URL}/tickets/recover/verify?token=${encodeURIComponent(
          rawToken
        )}`
      );
    }),

    // STEP 2: user submits OTP → decide next step, but DO NOT create session
    verifyRecoveryOtp: createAuthEndpoint(
      "/ticket/recover/verify",
      "POST",
      async (ctx) => {
        const body = ctx.body ?? (await ctx.request.json());
        const { token: rawToken, otp } = body || {};

        if (!rawToken || !otp)
          return ctx.json({ error: "Invalid request" }, 400);

        const tokenHash = hashToken(rawToken);

        const registration = await prisma.registration.findFirst({
          where: {
            recoveryTokenHash: tokenHash,
            deletedAt: null
          }
        });

        if (!registration) return ctx.json({ error: "Link invalid" }, 400);

        if (
          !registration.otpHash ||
          !registration.otpExpires ||
          registration.otpExpires < new Date()
        ) {
          return ctx.json({ error: "OTP expired" }, 400);
        }

        const valid = verifyOTP(otp, registration.otpHash);
        if (!valid) return ctx.json({ error: "Invalid OTP" }, 400);

        // clear OTP, but don't touch user/session yet
        await prisma.registration.update({
          where: { id: registration.id },
          data: {
            otpHash: null,
            otpExpires: null
          }
        });

        const email = registration.attendeeEmail;

        if (!email) {
          // very edge case; you can just let them view ticket by id
          return ctx.json({
            success: true,
            step: "TICKET_ONLY",
            registrationId: registration.id,
            redirectUrl:
              registration.redirectUrl ||
              `${process.env.CLIENT_URL}/registrations/${registration.id}`
          });
        }

        // Does a user already exist with this email?
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        const basePayload = {
          success: true,
          email,
          registrationId: registration.id,
          anonymousUserId: registration.userId // original anon owner
        };

        if (existingUser) {
          return ctx.json({
            ...basePayload,
            step: "LOGIN_EXISTING"
          });
        }

        return ctx.json({
          ...basePayload,
          step: "CREATE_ACCOUNT"
        });
      }
    )
  }
});

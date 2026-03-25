/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { openAPI, anonymous } from "better-auth/plugins";
import transporter from "../../lib/mailer.js";
import { ResetTemplate } from "../../lib/email/template/ResetTemplate.js";
import { VerifyTemplate } from "../../lib/email/template/VerifyTemplate.js";
import { publishEmailJob } from "../../utils/qstashPublisher.js";
import { ticketRecoveryPlugin } from "../recovery/ticketRecoveryPlugin.js";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4000"
  ],

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      await publishEmailJob({
        type: "reset",
        email: user.email,
        username: user.email,
        url
      });
    }
  },
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await publishEmailJob({
        type: "verification",
        email: user.email,
        username: user.email,
        url
      });
    },

    autoSignInAfterVerification: true,
    async afterEmailVerification(user) {
      console.log(`${user.email} successfully verified!`);
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID_BAUTH,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_BAUTH
    }
  },
  plugins: [
    openAPI(),
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const anonId = anonymousUser?.user?.id;
        const newId = newUser?.user?.id;
        console.log("onLinkAccount triggered!", {
          anonId,
          newId
        });

        if (!anonId || !newId) return;

        try {
          await prisma.$transaction([
            prisma.profile.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.event.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.registration.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.payment.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.notification.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.account.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.session.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            }),
            prisma.organizerSettings.updateMany({
              where: { userId: anonId },
              data: { userId: newId }
            })
          ]);
          // Ensure the new user has a profile
          const profileExists = newId
            ? await prisma.profile.findUnique({ where: { userId: newId } })
            : null;

          if (!profileExists) {
            await prisma.profile.create({ data: { userId: newId } });
            console.log(`Profile created for new user ${newId}`);
          }
          console.log(
            `Successfully linked anonymous user ${anonId} -> ${newId}`
          );
        } catch (err) {
          console.error("Failed to link anonymous user to real account:", err);
          throw err;
        }
      }
    }),
    ticketRecoveryPlugin()
  ],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const newUser = ctx.context.newSession?.user;
        if (newUser) {
          await prisma.profile.create({ data: { userId: newUser.id } });
        }
      }
    })
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    }
  },
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    path: "/"
  }
});

/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { openAPI } from "better-auth/plugins";
import transporter from "../../lib/mailer.js";
import { ResetTemplate } from "../../lib/email/template/ResetTemplate.js";
import { VerifyTemplate } from "../../lib/email/template/VerifyTemplate.js";
import { publishEmailJob } from "../../utils/qstashPublisher.js";

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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  plugins: [openAPI()],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const newUser = ctx.context.newSession?.user;
        if (newUser) {
          await prisma.profile.create({ data: { userId: newUser.id } });
        }
      }
    })
  }
});

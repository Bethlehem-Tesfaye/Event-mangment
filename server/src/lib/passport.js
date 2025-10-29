import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../lib/prisma.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Email not found in Google profile"));

        // Find existing user
        let user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, tokenVersion: true }
        });
        const dummyPassword = Math.random().toString(36).slice(-8);

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              password: dummyPassword,
              googleId: profile.id,
              isVerified: true,
              profile: { create: {} }
            },
            select: { id: true, email: true, tokenVersion: true }
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;

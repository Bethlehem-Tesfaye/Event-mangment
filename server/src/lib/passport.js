import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";

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

        // Check if Google verified the email
        const isVerified = profile.emails?.[0]?.verified || false;

        // Find existing user by email
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        // case1: User already exists AND has googleId linked
        if (existingUser && existingUser.googleId) {
          return done(null, existingUser);
        }

        // case 2: Existing password account, not yet linked
        if (existingUser && !existingUser.googleId) {
          //  Auto-link if Google verified the email
          if (isVerified) {
            const updatedUser = await prisma.user.update({
              where: { email },
              data: {
                googleId: profile.id,
                isVerified: true
              },
              select: { id: true, email: true, tokenVersion: true }
            });
            return done(null, updatedUser);
          }
          return done(
            new Error("Google email not verified — cannot auto-link account.")
          );
        }

        // case 3: No existing user, create new Google-only account
        const dummyPassword = Math.random().toString(36).slice(-8);
        const newUser = await prisma.user.create({
          data: {
            email,
            password: dummyPassword,
            googleId: profile.id,
            isVerified: true,
            hasPassword: false,
            profile: { create: {} }
          },
          select: { id: true, email: true, tokenVersion: true }
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;

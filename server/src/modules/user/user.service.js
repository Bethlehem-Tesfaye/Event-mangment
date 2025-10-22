import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../../lib/mailer.js";
import logger from "../../utils/logger.js";
import prisma from "../../lib/prisma.js";
import CustomError from "../../utils/customError.js";

dotenv.config();

const ACCESS_EXPIRES_IN = "1d";
const REFRESH_EXPIRES_IN = "7d";
const EMAIL_VERIFY_EXPIRES_IN = "1h";

const signEmailVerifyToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: EMAIL_VERIFY_EXPIRES_IN }
  );

const signAccessToken = (user) =>
  jwt.sign(
    { userId: user.id, tv: user.tokenVersion },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { userId: user.id, tv: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );

const setHashedRefreshToken = async (userId, refreshToken) => {
  const hash = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: hash },
    select: { id: true }
  });
};

export const registerUser = async ({ email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new CustomError("Email already registered", 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isVerified: false,
      profile: { create: {} }
    },
    select: { id: true, email: true, tokenVersion: true }
  });

  const token = signEmailVerifyToken(user);
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Welcome to EventLight!</h2>
      <p>Please verify your email address to activate your account.</p>
      <a href="${verificationLink}" 
         style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;
         text-decoration:none;border-radius:8px;">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;
  try {
    await transporter.sendMail({
      to: user.email,
      subject: "Verify your EventLight account",
      html
    });
    logger.info(`Verification email sent to ${user.email}`);
  } catch (err) {
    logger.error("Failed to send verification email", { error: err.message });
    throw new CustomError(
      "Registration failed while sending verification email",
      500
    );
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await setHashedRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email },
    accessToken,
    refreshToken
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, tokenVersion: true }
  });

  if (!user) throw new CustomError("Login failed, Please try again", 401);

  const passwordCheck = await bcrypt.compare(password, user.password);
  if (!passwordCheck)
    throw new CustomError("Login failed, Please try again", 401);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await setHashedRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email },
    accessToken,
    refreshToken
  };
};

export const refreshTokens = async (incomingRefreshToken) => {
  if (!incomingRefreshToken)
    throw new CustomError("Unauthorized: No refresh token provided", 401);

  let payload;
  try {
    payload = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new CustomError(`Unauthorized:${error}`, 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      tokenVersion: true,
      refreshTokenHash: true,
      isVerified: true
    }
  });
  if (!user) throw new CustomError("Unauthorized user ", 401);

  if (payload.tv !== user.tokenVersion)
    throw new CustomError("Unauthorized: Token revoked or expired", 401);

  const matches = user.refreshTokenHash
    ? await bcrypt.compare(incomingRefreshToken, user.refreshTokenHash)
    : false;

  if (!matches) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 }, refreshTokenHash: null }
    });
    throw new CustomError("Forbidden", 403);
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  await setHashedRefreshToken(user.id, newRefreshToken);

  return {
    user: { id: user.id, email: user.email, isVerified: user.isVerified },
    accessToken,
    refreshToken: newRefreshToken
  };
};

export const logoutUser = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null },
    select: { id: true }
  });
  return true;
};

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    const err = new Error("Current password is incorrect");
    err.status = 401;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed }
  });

  return { success: true };
}

export async function verrtfiyEmail(token) {
  if (!token) throw new CustomError("Token is required", 400);

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });
    if (!user) throw new CustomError("User not found", 404);

    if (user.isVerified) throw new CustomError("Email already verified", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    return { message: "Email verified successfully" };
  } catch (err) {
    throw new CustomError("Invalid or expired token", 400);
  }
}

export const resendVerification = async (email) => {
  if (!email) throw new CustomError("Email is required", 400);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new CustomError("User not found", 404);
  if (user.isVerified) throw new CustomError("Email already verified", 400);

  const token = signEmailVerifyToken({ id: user.id, email: user.email });
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const html = `<p>Please verify</p><a href="${verificationLink}">Verify</a>`;

  try {
    await transporter.sendMail({
      to: user.email,
      subject: "Resend: Verify your EventLight account",
      html
    });
  } catch (e) {
    /* eslint-disable no-console */
    console.log("error in resend ", e);
  }

  return { message: "Verification email resent" };
};

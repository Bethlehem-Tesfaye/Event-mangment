import express from "express";
import prisma from "../../lib/prisma.js";
import requireRealUserMiddleware from "../../middleware/requireRealUserMiddleware.js";

const router = express.Router();
router.post(
  "/recover/attach",
  requireRealUserMiddleware,
  async (req, res, next) => {
    try {
      const { registrationId } = req.body;
      const userId = req.userId;

      if (!registrationId) {
        return res.status(400).json({ error: "Missing registrationId" });
      }

      await prisma.registration.update({
        where: { id: Number(registrationId) },
        data: { userId }
      });

      return res.json({
        success: true,
        redirectUrl: `${process.env.CLIENT_URL}/registrations/${registrationId}`
      });
    } catch (err) {
      next(err);
    }
  }
);

// Attach all registrations for anonymousUserId+email to current user (optional)
router.post(
  "/recover/attach-from-anonymous",
  requireRealUserMiddleware,
  async (req, res, next) => {
    try {
      const { registrationId, anonymousUserId, email } = req.body;
      const newUserId = req.userId;

      if (!registrationId || !anonymousUserId || !email) {
        return res.status(400).json({ error: "Missing fields" });
      }

      // Transfer all registrations for that anon user and email
      await prisma.registration.updateMany({
        where: {
          userId: anonymousUserId,
          attendeeEmail: email
        },
        data: { userId: newUserId }
      });

      return res.json({
        success: true,
        redirectUrl: `${process.env.CLIENT_URL}/registrations/${registrationId}`
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

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
      const { userId } = req;

      if (!registrationId) {
        return res.status(400).json({ error: "Missing registrationId" });
      }

      await prisma.registration.updateMany({
        where: { id: Number(registrationId) },
        data: { userId }
      });

      return res.json({
        success: true,
        redirectUrl: `${process.env.CLIENT_URL}/registrations/${registrationId}`
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;

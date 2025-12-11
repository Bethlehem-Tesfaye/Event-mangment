import express from "express";
import prisma from "../../lib/prisma.js";
import authMiddleware from "../../middleware/authMiddleware.js";

export const organizerSettingsRoutes = express.Router();

// Save/update Chapa key
organizerSettingsRoutes.post(
  "/chapa-key",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { chapaKey } = req.body;
      const { userId } = req;

      if (!chapaKey)
        return res.status(400).json({ message: "Chapa key is required" });

      const updatedSettings = await prisma.organizerSettings.upsert({
        where: { userId },
        update: { chapaKey },
        create: { userId, chapaKey }
      });

      return res.status(200).json({ message: "Chapa key saved successfully" });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }
);

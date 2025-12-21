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

      await prisma.organizerSettings.upsert({
        where: { userId },
        update: { chapaKey },
        create: { userId, chapaKey }
      });

      return res.status(200).json({ message: "Chapa key saved successfully" });
    } catch (err) {
      return next(err);
    }
  }
);

organizerSettingsRoutes.put(
  "/chapa-key",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { chapaKey } = req.body;
      const { userId } = req;

      if (!chapaKey)
        return res.status(400).json({ message: "Chapa key is required" });

      const existing = await prisma.organizerSettings.findUnique({
        where: { userId },
        select: { userId: true }
      });

      if (!existing) {
        return res
          .status(404)
          .json({ message: "Chapa key not found to update" });
      }

      await prisma.organizerSettings.update({
        where: { userId },
        data: { chapaKey }
      });

      return res
        .status(200)
        .json({ message: "Chapa key updated successfully" });
    } catch (err) {
      return next(err);
    }
  }
);

organizerSettingsRoutes.get(
  "/chapa-key",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req;

      const settings = await prisma.organizerSettings.findUnique({
        where: { userId },
        select: { chapaKey: true }
      });

      if (!settings || !settings.chapaKey) {
        return res.status(404).json({ message: "Chapa key not found" });
      }

      return res.status(200).json({ chapaKey: settings.chapaKey });
    } catch (err) {
      return next(err);
    }
  }
);

import { tr } from "zod/v4/locales";
import prisma from "../../lib/prisma.js";

export const getNotification = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return notifications;
};

export const markAsRead = async (id) => {
  const read = await prisma.notification.update({
    where: { id },
    data: { read: true }
  });
  return read;
};

export const markAllAsRead = async (userId) => {
  const allRead = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });

  return allRead;
};

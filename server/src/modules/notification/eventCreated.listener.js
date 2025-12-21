import { eventBus } from "../../lib/eventBus.js";
import prisma from "../../lib/prisma.js";
import { getIO } from "../../infrastructure/socket/index.js";

eventBus.on("event.created", async ({ userId, eventId, title }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: "event_created",
        title: "Event Created",
        message: `Your event "${title}" was created successfully.`,
        eventId
      }
    });

    try {
      const io = getIO();
      io.to(`user:${userId}`).emit("notification:new", {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      });
      // eslint-disable-next-line no-empty
    } catch (sockErr) {}
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to handle event.created:", err?.message || err);
  }
});

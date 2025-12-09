import QRCode from "qrcode";
import prisma from "../../lib/prisma.js";
import CustomError from "../../utils/customError.js";
import {
  publishEmailJob,
  publishReminderJob
} from "../../utils/qstashPublisher.js";
import cloudinary from "../../lib/cloudinary.js";

export const getEvents = async ({
  limit = 20,
  offset = 0,
  search,
  categoryName
}) => {
  const whereMatch = {
    status: "published",
    deletedAt: null,
    title: search ? { contains: search, mode: "insensitive" } : undefined
  };

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where: {
        ...whereMatch,
        eventCategories: categoryName
          ? {
              some: {
                deletedAt: null,
                category: { name: categoryName }
              }
            }
          : { some: { deletedAt: null } }
      },
      skip: Number(offset) || 0,
      take: Number(limit) || 20,
      include: {
        user: { include: { profile: true } },
        eventCategories: {
          where: { deletedAt: null },
          include: { category: true }
        }
      }
    }),
    prisma.event.count({
      where: {
        ...whereMatch,
        eventCategories: categoryName
          ? {
              some: {
                deletedAt: null,
                category: { name: categoryName }
              }
            }
          : { some: { deletedAt: null } }
      }
    })
  ]);

  return { events, totalCount };
};
export const getEventById = async (eventId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, status: "published", deletedAt: null },
    include: {
      tickets: { where: { deletedAt: null } },
      eventSpeakers: { where: { deletedAt: null } },
      eventCategories: {
        where: { deletedAt: null },
        include: { category: true }
      },
      user: { include: { profile: true } }
    }
  });

  if (!event) throw new CustomError("Event not found", 404);

  return event;
};

export const getEventSpeakers = async (eventId) => {
  const speakers = await prisma.eventSpeaker.findMany({
    where: { eventId, deletedAt: null },
    select: { id: true, name: true, bio: true, photoUrl: true }
  });

  if (speakers.length === 0)
    throw new CustomError("No speakers found for this event", 404);

  return speakers;
};

export const getEventTickets = async (eventId) => {
  const tickets = await prisma.ticket.findMany({
    where: { eventId, deletedAt: null }
  });

  if (tickets.length === 0)
    throw new CustomError("No tickets found for this event", 404);

  return tickets;
};

export const purchaseTicket = async (
  { eventId, ticketId, userId, attendeeName, attendeeEmail, quantity },
  io
) => {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: parseInt(ticketId, 10),
      eventId,
      deletedAt: null
    }
  });

  if (!ticket) throw new CustomError("Ticket not found", 404);
  if (ticket.remainingQuantity < quantity) {
    throw new CustomError("Not enough tickets available", 409);
  }

  let emailForReceipt = null;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    if (!user) throw new CustomError("User not found", 404);
    emailForReceipt = (user.email || "").trim().toLowerCase();
  } else {
    if (!attendeeEmail)
      throw new CustomError("Email is required for guest purchase", 400);
    emailForReceipt = String(attendeeEmail).trim().toLowerCase();
  }

  // create registration + update ticket in transaction
  const reg = await prisma.$transaction(async (tx) => {
    const created = await tx.registration.create({
      data: {
        userId: userId || null,
        eventId: ticket.eventId,
        ticketType: ticket.id,
        registeredQuantity: quantity,
        attendeeName,
        attendeeEmail: emailForReceipt
      }
    });

    await tx.ticket.update({
      where: { id: ticket.id },
      data: { remainingQuantity: ticket.remainingQuantity - quantity }
    });

    return created;
  });

  // QR DATA
  const qrData = JSON.stringify({
    registrationId: reg.id,
    eventId: ticket.eventId,
    ticketId: ticket.id,
    attendeeName,
    attendeeEmail: emailForReceipt
  });

  const qrBuffer = await QRCode.toBuffer(qrData);
  const qrBase64 = qrBuffer.toString("base64");

  // upload QR to Cloudinary and get a public URL (fallback to null)
  let qrUrl = null;
  try {
    const uploadRes = await cloudinary.uploader.upload(
      `data:image/png;base64,${qrBase64}`,
      { folder: "tickets", use_filename: true }
    );
    qrUrl = uploadRes?.secure_url || uploadRes?.url || null;
  } catch (err) {
    process.stderr.write(
      `Cloudinary upload failed: ${err?.message ?? String(err)}\n`
    );
  }

  // Email job via QStash
  await publishEmailJob({
    type: "ticket",
    email: emailForReceipt,
    attendeeName,
    eventId,
    ticketId: ticket.id,
    qrBase64,
    qrUrl
  });

  // Schedule reminder
  try {
    const event = await prisma.event.findUnique({
      where: { id: ticket.eventId },
      select: { id: true, title: true, userId: true, startDatetime: true }
    });

    if (event) {
      await publishReminderJob({
        email: emailForReceipt,
        userId: userId || null,
        eventId: event.id,
        eventTitle: event.title,
        attendeeName,
        eventDate: event.startDatetime
      });
    }
  } catch (schedErr) {
    process.stderr.write(
      `Failed to schedule reminder: ${schedErr?.message ?? String(schedErr)}\n`
    );
  }

  // Notify event owner
  const event = await prisma.event.findUnique({
    where: { id: ticket.eventId },
    select: { id: true, title: true, userId: true }
  });

  if (event && event.userId) {
    let buyerName = attendeeName || emailForReceipt || "A user";
    if (userId) {
      const buyer = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          profile: { select: { firstName: true, lastName: true } }
        }
      });
      const full =
        `${buyer?.profile?.firstName || ""} ${buyer?.profile?.lastName || ""}`.trim();
      if (full) buyerName = full;
      else if (buyer?.email) buyerName = buyer.email;
    }

    const notifMessage = `${buyerName} purchased ${quantity} ticket${quantity > 1 ? "s" : ""} to your event "${event.title}".`;
    const notification = await prisma.notification.create({
      data: {
        userId: event.userId,
        type: "ticket_purchased",
        title: "Ticket Purchased",
        message: notifMessage,
        eventId: event.id
      }
    });

    if (io && typeof io.to === "function") {
      io.to(`user:${event.userId}`).emit("notification:new", {
        id: notification.id,
        eventId: event.id,
        type: "ticket_purchased",
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt
      });
    }
  }

  return reg;
};

export const createEvent = async (
  {
    userId,
    title,
    description,
    locationType,
    location,
    startDatetime,
    endDatetime,
    duration,
    eventBannerUrl
  },
  io
) => {
  const event = await prisma.event.create({
    data: {
      userId,
      title,
      description,
      locationType,
      location,
      startDatetime,
      endDatetime,
      duration: Number(duration),
      eventBannerUrl,
      status: "draft"
    }
  });
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: "event_created",
      title: "Event Created",
      message: `Your event "${title}" was created successfully.`,
      eventId: event.id
    }
  });

  io.to(`user:${userId}`).emit("notification:new", {
    id: notification.id,
    eventId: event.id,
    type: "event_created",
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt
  });

  return event;
};

export const getEventDetailById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      tickets: { where: { deletedAt: null } },
      eventSpeakers: { where: { deletedAt: null } },
      eventCategories: {
        where: { deletedAt: null },
        include: { category: true }
      },
      user: { select: { id: true, email: true } }
    }
  });

  if (!event) throw new CustomError("Event not found", 404);
  return event;
};
// Update event

export const updateEvent = async (eventId, userId, data, io) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });
  if (!event) throw new CustomError("Event not found", 404);

  const { status } = data || {};

  if (status) {
    const validTransitions = {
      draft: ["published", "cancelled"],
      published: ["draft", "cancelled"],
      cancelled: []
    };

    if (!validTransitions[event.status].includes(status)) {
      throw new CustomError(
        `Cannot change status from ${event.status} to ${status}`,
        400
      );
    }

    if (event.status === "draft" && status === "published") {
      const requiredFields = [
        event.title,
        event.description,
        event.locationType,
        event.startDatetime,
        event.endDatetime,
        event.duration
      ];

      if (requiredFields.some((f) => !f)) {
        throw new CustomError("Incomplete event data", 400);
      }

      const [cat, tkt] = await Promise.all([
        prisma.eventCategory.findFirst({
          where: { eventId: event.id, deletedAt: null }
        }),
        prisma.ticket.findFirst({
          where: { eventId: event.id, deletedAt: null }
        })
      ]);

      if (!cat || !tkt) {
        throw new CustomError(
          "Event must have category and ticket to publish",
          400
        );
      }
    }
  }

  //  Update event
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...data,
      deletedAt: status === "cancelled" ? new Date() : undefined,
      updatedAt: new Date()
    }
  });

  if (status) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: `event_${status}`,
        title: `Event ${status}`,
        message: `Your event "${event.title}" was  ${status} successfully.`,
        eventId
      }
    });

    io.to(`user:${userId}`).emit("notification:new", {
      id: notification.id,
      eventId,
      type: `event_${status}`,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt
    });
  }

  return updatedEvent;
};

// Soft delete event
export const deleteEvent = async (eventId) => {
  const event = await prisma.event.update({
    where: { id: eventId },
    data: { deletedAt: new Date() }
  });
  return event;
};

export const addCategoryToEvent = async ({ eventId, categoryId }) => {
  return prisma.eventCategory.create({
    data: {
      eventId,
      categoryId: parseInt(categoryId, 10)
    }
  });
};
// Remove category (soft delete)
export const removeCategoryFromEvent = async ({ eventId, categoryId }) => {
  return prisma.eventCategory.update({
    where: {
      eventId_categoryId: {
        eventId,
        categoryId: parseInt(categoryId, 10)
      }
    },
    data: { deletedAt: new Date() }
  });
};

export const getEventAnalytics = async (eventId, userId) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null }
  });

  if (!event) throw new CustomError("Event not found", 404);

  if (event.userId !== userId) {
    throw new CustomError(
      "Unauthorized: You are not the organizer of this event",
      403
    );
  }

  const ticketsSold = await prisma.registration.groupBy({
    by: ["ticketType"],
    where: { eventId: event.id, deletedAt: null },
    _sum: { registeredQuantity: true },
    _count: { id: true }
  });

  const ticketData = await Promise.all(
    ticketsSold.map(async (t) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: t.ticketType }
      });
      return {
        ticket_type: ticket.type,
        tickets_sold: t._sum.registeredQuantity || 0,
        revenue: (t._sum.registeredQuantity || 0) * parseFloat(ticket.price)
      };
    })
  );

  const totalRevenue = ticketData.reduce((acc, t) => acc + t.revenue, 0);
  const totalTicketsSold = ticketData.reduce(
    (acc, t) => acc + t.tickets_sold,
    0
  );

  return {
    totalRevenue,
    totalTicketsSold,
    tickets: ticketData
  };
};

export const getEventAttendeesService = async (eventId) => {
  const registrations = await prisma.registration.findMany({
    where: { eventId, deletedAt: null },
    include: {
      ticket: { select: { type: true } },
      user: {
        select: {
          email: true,
          profile: { select: { firstName: true, lastName: true } }
        }
      }
    }
  });

  if (!registrations.length) {
    throw new CustomError("No attendees found", 404);
  }

  const attendees = registrations.map((r) => {
    let fullName = "";
    const profileFirst = r.user?.profile?.firstName?.trim();
    const profileLast = r.user?.profile?.lastName?.trim();

    if (profileFirst || profileLast) {
      fullName =
        `${profileFirst || ""}${profileFirst && profileLast ? " " : ""}${profileLast || ""}`.trim();
    } else if (r.attendeeName) {
      fullName = String(r.attendeeName).trim();
    } else if (r.user?.email) {
      fullName = r.user.email;
    } else if (r.attendeeEmail) {
      fullName = r.attendeeEmail;
    } else {
      fullName = "N/A";
    }

    const email = r.user?.email || r.attendeeEmail || "N/A";

    return {
      full_name: fullName,
      email,
      ticket_type: r.ticket.type,
      registered_quantity: r.registeredQuantity,
      registered_at: r.registeredAt.toISOString()
    };
  });

  return attendees;
};

// retrun the all categories listed in the db
export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" }
  });

  return categories;
};

export const getOrganizerEvents = async (
  userId,
  { limit = 20, offset = 0, status, search } = {}
) => {
  if (!userId) throw new CustomError("User ID is required", 400);

  const where = {
    userId,
    deletedAt: null,
    title: search ? { contains: search, mode: "insensitive" } : undefined
  };
  if (status) where.status = status;

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      skip: Number(offset) || 0,
      take: Number(limit) || 20,
      orderBy: { createdAt: "desc" },
      include: {
        tickets: { where: { deletedAt: null } },
        eventSpeakers: { where: { deletedAt: null } },
        eventCategories: {
          where: { deletedAt: null },
          include: { category: true }
        },
        _count: { select: { registrations: true } }
      }
    }),
    prisma.event.count({ where })
  ]);

  const eventsWithCounts = events.map((e) => ({
    ...e,
    attendeesCount: (e._count && e._count.registrations) || 0
  }));

  return { events: eventsWithCounts, totalCount };
};

export const getDashboardStatsService = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  const { events } = await getOrganizerEvents(userId);

  let totalRevenue = 0;
  let totalTicketsSold = 0;

  for (const event of events) {
    const analytics = await getEventAnalytics(event.id, userId);
    totalRevenue += analytics.totalRevenue;
    totalTicketsSold += analytics.totalTicketsSold;
  }

  return {
    totalEvents: events.length,
    totalRevenue,
    totalTicketsSold
  };
};

export const getUserRegistrations = async (userId) => {
  if (!userId) throw new CustomError("User ID is required", 400);

  const regs = await prisma.registration.findMany({
    where: { userId, deletedAt: null },
    orderBy: { registeredAt: "desc" },
    include: {
      ticket: true,
      event: true,
      user: true
    }
  });

  return regs;
};

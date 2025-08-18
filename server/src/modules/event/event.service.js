import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import transporter from "../../lib/mailer.js";
import prisma from "../../lib/prisma.js";
import CustomError from "../../utils/customError.js";

export const getEvents = async ({
  limit = 20,
  offset = 0,
  search,
  categoryName
}) => {
  const whereMatch = {
    status: "published",
    deletedAt: null,
    title: search ? { contains: search } : undefined
  };

  const events = await prisma.event.findMany({
    where: whereMatch,
    skip: parseInt(offset, 10),
    take: parseInt(limit, 10),
    include: {
      user: { include: { profile: true } },
      eventCategories: {
        where: { deletedAt: null },
        include: {
          category: categoryName ? { where: { name: categoryName } } : true
        }
      }
    }
  });

  if (events.length === 0)
    throw new CustomError("No published events found", 404);

  return events;
};

export const getEventById = async (eventId) => {
  const event = await prisma.event.findFirst({
    where: { id: parseInt(eventId, 10), status: "published", deletedAt: null },
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
    where: { eventId: parseInt(eventId, 10), deletedAt: null },
    select: { id: true, name: true, bio: true, photoUrl: true }
  });

  if (speakers.length === 0)
    throw new CustomError("No speakers found for this event", 404);

  return speakers;
};

export const getEventTickets = async (eventId) => {
  const tickets = await prisma.ticket.findMany({
    where: { eventId: parseInt(eventId, 10), deletedAt: null }
  });

  if (tickets.length === 0)
    throw new CustomError("No tickets found for this event", 404);

  return tickets;
};

export const purchaseTicket = async ({
  eventId,
  ticketId,
  userId,
  attendeeName,
  attendeeEmail,
  quantity
}) => {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: parseInt(ticketId, 10),
      eventId: parseInt(eventId, 10),
      deletedAt: null
    }
  });

  if (!ticket) throw new CustomError("Ticket not found", 404);
  if (ticket.remainingQuantity < quantity) {
    throw new CustomError("Not enough tickets available", 409);
  }

  if (userId) {
    const userRegistrations = await prisma.registration.findMany({
      where: { userId, ticketType: ticket.id, deletedAt: null }
    });

    const totalQuantity =
      userRegistrations.reduce((sum, r) => sum + r.registeredQuantity, 0) +
      quantity;

    if (totalQuantity > ticket.maxPerUser) {
      throw new CustomError(
        `Max ${ticket.maxPerUser} tickets allowed per user`,
        400
      );
    }
  }

  const reg = await prisma.$transaction(async (prismaTx) => {
    // create registration
    const created = await prismaTx.registration.create({
      data: {
        userId: userId || null,
        eventId: ticket.eventId,
        ticketType: ticket.id,
        registeredQuantity: quantity,
        attendeeName,
        attendeeEmail
      }
    });

    // decrement ticket count
    await prismaTx.ticket.update({
      where: { id: ticket.id },
      data: { remainingQuantity: ticket.remainingQuantity - quantity }
    });

    return created;
  });

  // Generate QR JSON payload
  const qrData = JSON.stringify({
    registrationId: reg.id,
    eventId: ticket.eventId,
    ticketId: ticket.id,
    attendeeName,
    attendeeEmail
  });

  // Save QR code to file
  const qrDir = path.join(process.cwd(), "uploads", "qrcodes");
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

  const qrPath = path.join(qrDir, `ticket-${reg.id}.png`);
  await QRCode.toFile(qrPath, qrData);

  // Update registration with QR path
  const updatedReg = await prisma.registration.update({
    where: { id: reg.id },
    data: { qrCodeUrl: `/uploads/qrcodes/ticket-${reg.id}.png` }
  });

  await transporter.sendMail({
    from: `"Event App" <${process.env.SMTP_USER}>`,
    to: attendeeEmail,
    subject: `🎟 Your Ticket for Event #${eventId}`,
    html: `
      <h2>Hello ${attendeeName},</h2>
      <p>Thank you for purchasing a <b>${ticket.type}</b> ticket.</p>
      <p>Here’s your QR code:</p>
      <p><img src="cid:ticketqr-${reg.id}" alt="QR Code" /></p>
      <p>Please present this QR code at the entrance.</p>
    `,
    attachments: [
      {
        filename: "ticket-qr.png",
        path: qrPath,
        cid: `ticketqr-${reg.id}`
      }
    ]
  });

  return updatedReg;
};

export const createEvent = async ({
  userId,
  title,
  description,
  locationType,
  location,
  startDatetime,
  endDatetime,
  duration,
  eventBannerUrl
}) => {
  const event = await prisma.event.create({
    data: {
      userId,
      title,
      description,
      locationType,
      location,
      startDatetime,
      endDatetime,
      duration,
      eventBannerUrl,
      status: "draft"
    }
  });
  return event;
};

export const getEventDetailById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(eventId, 10) },
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

export const updateEvent = async (eventId, userId, data) => {
  const event = await prisma.event.findFirst({
    where: { id: parseInt(eventId, 10), userId }
  });
  if (!event) throw new CustomError("Event not found", 404);

  const { status } = data;

  if (status) {
    const validTransitions = {
      draft: ["published"],
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
        event.duration,
        event.eventBannerUrl
      ];

      if (requiredFields.some((f) => !f)) {
        throw new CustomError("Incomplete event data", 400);
      }

      const [cat, spk, tkt] = await Promise.all([
        prisma.eventCategory.findFirst({
          where: { eventId: event.id, deletedAt: null }
        }),
        prisma.eventSpeaker.findFirst({
          where: { eventId: event.id, deletedAt: null }
        }),
        prisma.ticket.findFirst({
          where: { eventId: event.id, deletedAt: null }
        })
      ]);

      if (!cat || !spk || !tkt) {
        throw new CustomError(
          "Event must have category, speaker, and ticket to publish",
          400
        );
      }
    }
  }

  //  Update event
  const updatedEvent = await prisma.event.update({
    where: { id: parseInt(eventId, 10) },
    data: {
      ...data,
      deletedAt: status === "cancelled" ? new Date() : undefined,
      updatedAt: new Date()
    }
  });

  return updatedEvent;
};

// Soft delete event
export const deleteEvent = async (eventId) => {
  const event = await prisma.event.update({
    where: { id: parseInt(eventId, 10) },
    data: { deletedAt: new Date() }
  });
  return event;
};
// Create ticket for event
export const createTicket = async ({
  eventId,
  type,
  price,
  totalQuantity,
  maxPerUser
}) => {
  const ticket = await prisma.ticket.create({
    data: {
      eventId: parseInt(eventId, 10),
      type,
      price,
      totalQuantity,
      remainingQuantity: totalQuantity,
      maxPerUser
    }
  });
  return ticket;
};
// GET ALL TICKETS FOR AN EVENT
export const getTicketsForEvent = async (eventId) => {
  const tickets = await prisma.ticket.findMany({
    where: { eventId: parseInt(eventId, 10), deletedAt: null }
  });

  if (tickets.length === 0)
    throw new CustomError("No tickets found for this event", 404);

  return tickets;
};

// Update ticket
export const updateTicket = async (ticketId, data) => {
  const ticket = await prisma.ticket.update({
    where: { id: parseInt(ticketId, 10) },
    data: { ...data, updatedAt: new Date() }
  });
  return ticket;
};

// Soft delete ticket
export const deleteTicket = async (ticketId) => {
  return prisma.ticket.update({
    where: { id: parseInt(ticketId, 10) },
    data: { deletedAt: new Date() }
  });
};

// Create speaker for event
export const createSpeaker = async ({ eventId, name, bio, photoUrl }) => {
  const speaker = await prisma.eventSpeaker.create({
    data: { eventId: parseInt(eventId, 10), name, bio, photoUrl }
  });
  return speaker;
};

// Update speaker
export const updateSpeaker = async (speakerId, data) => {
  const speaker = await prisma.eventSpeaker.update({
    where: { id: parseInt(speakerId, 10) },
    data: { ...data, updatedAt: new Date() }
  });
  return speaker;
};

export const getSpeakersForEvent = async (eventId) => {
  const speakers = await prisma.eventSpeaker.findMany({
    where: { eventId: parseInt(eventId, 10), deletedAt: null },
    select: { id: true, name: true, bio: true, photoUrl: true }
  });

  if (speakers.length === 0)
    throw new CustomError("No speakers found for this event", 404);

  return speakers;
};

export const deleteSpeaker = async (speakerId) => {
  return prisma.eventSpeaker.update({
    where: { id: parseInt(speakerId, 10) },
    data: { deletedAt: new Date() }
  });
};

export const addCategoryToEvent = async ({ eventId, categoryId }) => {
  return prisma.eventCategory.create({
    data: {
      eventId: parseInt(eventId, 10),
      categoryId: parseInt(categoryId, 10)
    }
  });
};
// Remove category (soft delete)
export const removeCategoryFromEvent = async ({ eventId, categoryId }) => {
  return prisma.eventCategory.update({
    where: {
      eventId_categoryId: {
        eventId: parseInt(eventId, 10),
        categoryId: parseInt(categoryId, 10)
      }
    },
    data: { deletedAt: new Date() }
  });
};

export const getEventAnalytics = async (eventId, userId) => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(eventId, 10), deletedAt: null }
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
    where: { eventId: parseInt(eventId, 10), deletedAt: null },
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
    const fullName = r.user
      ? `${r.user.profile?.firstName || ""} ${r.user.profile?.lastName || ""}`.trim()
      : r.attendeeName || "N/A";

    const email = r.user ? r.user.email : r.attendeeEmail || "N/A";

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

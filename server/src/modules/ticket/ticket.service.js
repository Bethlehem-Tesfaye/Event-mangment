import prisma from "../../lib/prisma.js";
import CustomError from "../../utils/customError.js";

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

export const getUserTicketHistory = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: {
      userId,
      deletedAt: null
    },
    include: {
      event: true,
      ticket: true
    },
    orderBy: {
      registeredAt: "desc"
    }
  });
  return registrations;
};

import prisma from "../lib/prisma.js";
import CustomError from "../utils/customError.js";

export const eventRegister = async (req, res, next) => {
  const { userId } = req;
  const { ticketId, id: eventId } = req.params;

  const { registeredQuantity } = req.body;

  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: parseInt(ticketId, 10),
        eventId: parseInt(eventId, 10),
        deletedAt: null
      }
    });

    if (!ticket) {
      return next(new CustomError("Ticket not found", 404));
    }

    if (registeredQuantity > ticket.remainingQuantity) {
      return next(new CustomError("Not enough tickets available", 400));
    }

    const existingCount = await prisma.registration.aggregate({
      _sum: {
        registeredQuantity: true
      },
      where: {
        userId,
        ticketType: parseInt(ticketId, 10),
        deletedAt: null
      }
    });

    const alreadyRegistered = existingCount._sum.registeredQuantity || 0;

    if (alreadyRegistered + registeredQuantity > ticket.maxPerUser) {
      return next(
        new CustomError(
          `You can only register up to ${ticket.maxPerUser} tickets.`,
          400
        )
      );
    }

    // Prisma transaction: update ticket + create registration
    const [, newRegistration] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id: parseInt(ticketId, 10) },
        data: {
          remainingQuantity: {
            decrement: registeredQuantity
          },
          updatedAt: new Date()
        }
      }),
      prisma.registration.create({
        data: {
          userId,
          ticketType: parseInt(ticketId, 10),
          registeredQuantity,
          eventId: parseInt(eventId, 10)
        }
      })
    ]);

    return res.status(200).json({
      data: { registration: newRegistration }
    });
  } catch (error) {
    return next(error);
  }
};

export const viewMyTickets = async (req, res, next) => {
  const { userId } = req;

  try {
    const myTickets = await prisma.registration.findMany({
      where: {
        userId,
        deletedAt: null,
        ticket: {
          deletedAt: null,
          event: { deletedAt: null }
        }
      },
      include: {
        ticket: {
          select: {
            type: true,
            event: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    if (myTickets.length === 0) {
      return next(new CustomError("No tickets purchased", 404));
    }

    return res.status(200).json({
      data: { myTickets }
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  const { userId } = req;
  const { registrationId } = req.params;

  try {
    const registration = await prisma.registration.findFirst({
      where: {
        id: parseInt(registrationId, 10),
        deletedAt: null
      },
      include: {
        ticket: {
          include: {
            event: true
          }
        }
      }
    });

    if (!registration) {
      return next(new CustomError("Registration not found", 404));
    }

    if (registration.userId !== userId) {
      return next(
        new CustomError("Unauthorized to cancel this registration", 403)
      );
    }

    const now = new Date();
    if (registration.ticket.event.startDatetime <= now) {
      return next(
        new CustomError(
          "Cannot cancel registration after event has started",
          400
        )
      );
    }

    await prisma.$transaction([
      prisma.registration.update({
        where: { id: parseInt(registrationId, 10) },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.ticket.update({
        where: { id: registration.ticket.id },
        data: {
          remainingQuantity: {
            increment: registration.registeredQuantity
          },
          updatedAt: new Date()
        }
      })
    ]);

    return res.status(200).json();
  } catch (error) {
    return next(error);
  }
};

export const getEventAttendees = async (req, res, next) => {
  const eventId = parseInt(req.params.id, 10);

  try {
    const attendees = await prisma.registration.findMany({
      where: {
        eventId,
        deletedAt: null,
        user: {
          deletedAt: null
        },
        ticket: {
          deletedAt: null
        }
      },
      select: {
        registeredQuantity: true,
        registeredAt: true,
        ticket: {
          select: {
            type: true
          }
        },
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (attendees.length === 0) {
      return next(new CustomError("no attendees", 404));
    }

    const formatted = attendees.map((a) => ({
      full_name: `${a.user.profile.firstName} ${a.user.profile.lastName}`,
      email: a.user.email,
      ticket_type: a.ticket.type,
      registered_quantity: a.registeredQuantity,
      registered_at: a.registeredAt
    }));

    return res.status(200).json({
      data: {
        attendees: formatted
      }
    });
  } catch (err) {
    return next(err);
  }
};

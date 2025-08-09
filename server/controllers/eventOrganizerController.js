import prisma from "../lib/prisma.js";
import CustomError from "../utils/customError.js";

// create only the title and category
export const createEvent = async (req, res, next) => {
  try {
    const { event = {}, categoryIds = [] } = req.body;
    const { userId } = req;

    const createdEvent = await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        locationType: event.locationType,
        location: event.location,
        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,
        duration: event.duration,
        eventBannerUrl: event.eventBannerUrl,
        userId,
        eventCategories: categoryIds.length
          ? {
              create: categoryIds.map((categoryId) => ({
                category: {
                  connect: { id: categoryId }
                }
              }))
            }
          : undefined
      }
    });

    return res.status(201).json({
      data: {
        event: createdEvent
      }
    });
  } catch (error) {
    return next(error);
  }
};

// get event inforamtion fro db
export const getEventDetails = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    const event = await prisma.event.findUnique({
      where: {
        id: eventId
      },
      include: {
        tickets: {
          where: { deletedAt: null }
        },
        eventSpeakers: {
          where: {
            deletedAt: null
          }
        }
      }
    });
    if (!event) {
      return next(new CustomError("event not found", 404));
    }

    return res.status(200).json({
      data: {
        event
      }
    });
  } catch (error) {
    return next(error);
  }
};

// update the event
export const updateEvent = async (req, res, next) => {
  const eventId = parseInt(req.params.id, 10);
  const { userId } = req; // from auth middleware
  const { eventInfo = {}, speakers = [], tickets = [] } = req.body;
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: parseInt(eventId, 10),
        userId,
        deletedAt: null
      }
    });

    if (!event) {
      return next(new CustomError("Event not found", 404));
    }
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(eventId, 10) },
      data: {
        title: eventInfo.title,
        description: eventInfo.description,
        locationType: eventInfo.locationType,
        location: eventInfo.location,
        startDatetime: eventInfo.startDateTime,
        endDatetime: eventInfo.endDateTime,
        duration: eventInfo.duration,
        eventBannerUrl: eventInfo.eventBannerUrl ?? null,
        updatedAt: new Date()
      }
    });

    // Helper function to soft delete removed records:
    async function softDeleteRemoved(model, items) {
      // IDs sent in payload (for update or add)
      const newIds = items.filter((item) => item.id).map((item) => item.id);

      await prisma[model].updateMany({
        where: {
          eventId,
          deletedAt: null,
          NOT: {
            id: { in: newIds.length > 0 ? newIds : [0] }
          }
        },
        data: {
          deletedAt: new Date()
        }
      });
    }

    // delete speakers
    await softDeleteRemoved("eventSpeaker", speakers);
    // delted tickets
    await softDeleteRemoved("ticket", tickets);

    // Update and add new speakers
    for (const spk of speakers) {
      if (spk.id) {
        await prisma.eventSpeaker.update({
          where: { id: spk.id },
          data: {
            name: spk.name,
            bio: spk.bio,
            photoUrl: spk.photoUrl ?? null,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.eventSpeaker.create({
          data: {
            eventId: parseInt(eventId, 10),
            name: spk.name,
            bio: spk.bio,
            photoUrl: spk.photoUrl ?? null
          }
        });
      }
    }

    // Update amd add new tickets
    for (const tkt of tickets) {
      if (tkt.id) {
        await prisma.ticket.update({
          where: { id: tkt.id },
          data: {
            type: tkt.type,
            price: tkt.price,
            totalQuantity: tkt.totalQuantity,
            remainingQuantity: tkt.totalQuantity,
            maxPerUser: tkt.maxPerUser ?? 1,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.ticket.create({
          data: {
            eventId: parseInt(eventId, 10),
            type: tkt.type,
            price: tkt.price,
            totalQuantity: tkt.totalQuantity,
            remainingQuantity: tkt.totalQuantity,
            maxPerUser: tkt.maxPerUser ?? 1
          }
        });
      }
    }

    const [updatedSpeakers, updatedTickets] = await Promise.all([
      prisma.eventSpeaker.findMany({
        where: { eventId: parseInt(eventId, 10), deletedAt: null }
      }),
      prisma.ticket.findMany({
        where: { eventId: parseInt(eventId, 10), deletedAt: null }
      })
    ]);

    return res.status(200).json({
      data: {
        event: updatedEvent,
        speaker: updatedSpeakers,
        tickets: updatedTickets
      }
    });
  } catch (error) {
    return next(error);
  }
};

// list all categories table
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true }
    });
    return res.status(200).json({ data: { Categories: categories } });
  } catch (error) {
    return next(error);
  }
};

// publish or cancel published event
export const updateEventStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const { userId } = req;

  try {
    // 1. Check if the event exists and belongs to the current user
    const event = await prisma.event.findFirst({
      where: { id: parseInt(id, 10), userId }
    });

    if (!event) return next(new CustomError("Event not found", 404));

    // If the user wants to publish the event, validate event completeness
    if (status === "published") {
      // Required event fields for publishing
      const requiredFields = [
        event.title,
        event.description,
        event.locationType,
        event.startDatetime,
        event.endDatetime,
        event.duration,
        event.eventBannerUrl
      ];
      // Check if any required field is missing
      if (requiredFields.some((f) => !f)) {
        return next(new CustomError("Incomplete event data", 400));
      }

      // Check if event has at least one category, speaker, and ticket before publishing
      const [cat, spk, tkt] = await Promise.all([
        prisma.eventCategory.findFirst({ where: { eventId: event.id } }),
        prisma.eventSpeaker.findFirst({ where: { eventId: event.id } }),
        prisma.ticket.findFirst({ where: { eventId: event.id } })
      ]);

      if (!cat || !spk || !tkt) {
        return next(
          new CustomError(
            "Event must have category, speaker, and ticket to publish",
            400
          )
        );
      }
    }

    // Update the event status
    // If status is 'cancelled', set deleted_at timestamp for soft delete
    // Otherwise update status yo published
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id, 10), userId },
      data: {
        status,
        deletedAt: status === "cancelled" ? new Date() : undefined
      }
    });

    return res.status(200).json({ data: { event: updatedEvent } });
  } catch (error) {
    return next(error);
  }
};

// deleted draft event
export const deleteDraftEvent = async (req, res, next) => {
  const { userId } = req;
  const { id } = req.params;

  try {
    const event = await prisma.event.updateMany({
      where: {
        id: parseInt(id, 10),
        userId,
        status: "draft"
      },
      data: { deletedAt: new Date() }
    });

    if (event.count === 0) {
      return next(
        new CustomError("Draft event not found or cannot be deleted", 404)
      );
    }

    return res.status(200).json({ data: { event } });
  } catch (error) {
    return next(error);
  }
};

// list organizers events by status(draft or published)
export const getEvents = async (req, res, next) => {
  const { userId } = req;
  const { status } = req.query;

  try {
    const events = await prisma.event.findMany({
      where: {
        userId,
        deletedAt: null,
        status: status || undefined
      }
    });

    return res.status(200).json({
      data: { events }
    });
  } catch (error) {
    return next(error);
  }
};

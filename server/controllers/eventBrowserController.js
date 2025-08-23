import prisma from "../lib/prisma.js";
import CustomError from "../utils/customError.js";

//  browsed events
export const getAllEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: "published" },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    if (events.length === 0) {
      return next(new CustomError("no published event", 404));
    }
    return res.status(200).json({ data: events });
  } catch (error) {
    return next(error);
  }
};

// the get the preview of those browesed events
export const getEventPreview = async (req, res, next) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findFirst({
      where: {
        id: parseInt(id, 10),
        status: "published"
      },
      include: {
        tickets: {
          where: { deletedAt: null }
        },
        eventSpeakers: {
          where: { deletedAt: null }
        },
        eventCategories: {
          where: { deletedAt: null },
          select: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!event) {
      return next(new CustomError("Event not found", 404));
    }

    return res.status(200).json({
      event
    });
  } catch (error) {
    return next(error);
  }
};

import prisma from "../lib/prisma.js";
import CustomError from "../utils/customError.js";

const isEventOwner = async (req, res, next) => {
  const { eventId } = req.params;
  const { userId } = req;

  if (!userId) {
    return next(new CustomError("Unauthorized, Missing userId", 401));
  }

  if (!eventId) {
    return next(new CustomError("Missing event ID", 400));
  }

  try {
    const event = await prisma.event.findFirst({
      where: {
        id: parseInt(eventId, 10),
        userId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!event) {
      return next(new CustomError("Not authorized to modify this event", 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default isEventOwner;

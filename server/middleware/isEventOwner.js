import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

const isEventOwner = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { userId } = req;

  if (!userId) {
    return next(new CustomError("Unauthorized, Missing userId", 401));
  }

  if (!eventId) {
    return next(new CustomError("Missing event ID", 400));
  }

  try {
    const query =
      "SELECT id FROM events WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL";
    const result = await conn.query(query, [eventId, userId]);

    if (result.rowCount === 0) {
      return next(new CustomError("Not authorized to modify this event", 403));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default isEventOwner;

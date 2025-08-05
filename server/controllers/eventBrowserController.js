import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

//  browsed events
export const getAllEvents = async (req, res, next) => {
  try {
    const query =
      "SELECT e.id, e.title, e.description, e.start_datetime, e.location, p.first_name FROM events e JOIN profiles p ON p.user_id = e.user_id WHERE e.status = $1";

    const result = await conn.query(query, ["published"]);
    if (result.rows.length === 0) {
      return next(new CustomError("no published event", 404));
    }
    return res
      .status(200)
      .json({ data: result.rows, message: "published events" });
  } catch (error) {
    return next(error);
  }
};

// the get the preview of those browesed events
export const getEventPreview = async (req, res, next) => {
  const { id } = req.params;

  try {
    const eventQuery = conn.query(
      "SELECT * FROM events WHERE id = $1 AND status = 'published'",
      [id]
    );
    const speakersQuery = conn.query(
      "SELECT * FROM event_speakers WHERE event_id = $1 AND deleted_at IS NULL",
      [id]
    );
    const ticketsQuery = conn.query(
      "SELECT * FROM tickets WHERE event_id = $1 AND deleted_at IS NULL",
      [id]
    );
    const categoriesQuery = conn.query(
      "SELECT c.id, c.name FROM event_categories ec JOIN categories c ON ec.category_id = c.id WHERE ec.event_id = $1 AND ec.deleted_at IS NULL",
      [id]
    );

    const [eventResult, speakersResult, ticketsResult, categoriesResult] =
      await Promise.all([
        eventQuery,
        speakersQuery,
        ticketsQuery,
        categoriesQuery
      ]);

    if (eventResult.rows.length === 0) {
      return next(new CustomError("Event not found", 404));
    }

    return res.status(200).json({
      event: eventResult.rows[0],
      speakers: speakersResult.rows,
      tickets: ticketsResult.rows,
      categories: categoriesResult.rows
    });
  } catch (error) {
    return next(error);
  }
};

import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

// events table
export const createEvent = async (req, res, next) => {
  const { userId } = req;
  const {
    title,
    description,
    locationType,
    location,
    startDateTime,
    endDateTime,
    duration,
    eventBannerUrl
  } = req.body;

  try {
    const result = await conn.query(
      "INSERT INTO events (user_id, title, description, location_type, location,start_datetime, end_datetime, duration,event_banner_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft') RETURNING *",
      [
        userId,
        title,
        description,
        locationType,
        location,
        startDateTime,
        endDateTime,
        duration,
        eventBannerUrl
      ]
    );

    return res
      .status(201)
      .json({ success: true, message: "Draft created", event: result.rows[0] });
  } catch (error) {
    return next(error);
  }
};
export const updateEventInfo = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req;
  const {
    title,
    description,
    locationType,
    location,
    startDateTime,
    endDateTime,
    duration,
    eventBannerUrl
  } = req.body;

  try {
    const result = await conn.query(
      "UPDATE events SET title = $1, description = $2, location_type = $3,location = $4, start_datetime = $5, end_datetime = $6, duration = $7, event_banner_url = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 AND user_id = $10 RETURNING *",
      [
        title,
        description,
        locationType,
        location,
        startDateTime,
        endDateTime,
        duration,
        eventBannerUrl,
        id,
        userId
      ]
    );

    if (result.rowCount === 0) {
      return next(new CustomError("Event not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Event info updated",
      event: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};
export const getEventInfo = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req;
  try {
    const result = await conn.query(
      "SELECT title, description, location_type, location,start_datetime, end_datetime, duration,event_banner_url FROM events WHERE id = $1 AND user_id=$2",
      [id, userId]
    );
    return res.status(200).json({ success: true, event: result.rows[0] });
  } catch (error) {
    return next(error);
  }
};

// tickets table
export const addTickets = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { tickets } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");
    const inserted = [];

    for (const t of tickets) {
      const result = await client.query(
        "INSERT INTO tickets (event_id, type, price, total_quantity, current_quantity, max_per_user) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          eventId,
          t.type,
          t.price,
          t.total_quantity,
          t.total_quantity,
          t.max_per_user ?? 1
        ]
      );
      inserted.push(result.rows[0]);
    }
    await client.query("COMMIT");
    return res.status(201).json(inserted);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};
export const updateTickets = async (req, res, next) => {
  const { id: eventId } = req.params;
  const {
    newTickets = [],
    updatedTickets = [],
    deletedTicketIds = []
  } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    // soft delete
    for (const id of deletedTicketIds) {
      await client.query(
        "UPDATE tickets SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND event_id = $2",
        [id, eventId]
      );
    }

    // update
    for (const ticket of updatedTickets) {
      await client.query(
        "UPDATE tickets SET type = $1, price = $2, total_quantity = $3, current_quantity = $4, max_per_user = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND event_id = $7",
        [
          ticket.type,
          ticket.price,
          ticket.total_quantity,
          ticket.total_quantity,
          ticket.max_per_user ?? 1,
          ticket.id,
          eventId
        ]
      );
    }

    // insert new ticket
    for (const t of newTickets) {
      await client.query(
        "INSERT INTO tickets (event_id, type, price, total_quantity, current_quantity, max_per_user) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          eventId,
          t.type,
          t.price,
          t.total_quantity,
          t.total_quantity,
          t.max_per_user ?? 1
        ]
      );
    }

    const updatedTicketsResult = await conn.query(
      "SELECT * FROM tickets WHERE event_id = $1 AND deleted_at IS NULL",
      [eventId]
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "tickets updated",
      tickets: updatedTicketsResult.rows
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};
export const getEventTickets = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await conn.query(
      "SELECT id, type, price, total_quantity, current_quantity, max_per_user FROM tickets WHERE event_id = $1 AND deleted_at IS NULL",
      [id]
    );
    return res.status(200).json({ success: true, tickets: result.rows });
  } catch (error) {
    return next(error);
  }
};

// event_speakers table
export const addSpeakers = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { speakers } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");
    const inserted = [];

    for (const s of speakers) {
      const result = await client.query(
        "INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3) RETURNING *",
        [eventId, s.name, s.bio]
      );
      inserted.push(result.rows[0]);
    }
    await client.query("COMMIT");
    return res.status(201).json(inserted);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};
export const updateSpeakers = async (req, res, next) => {
  const { id: eventId } = req.params;
  const {
    newSpeakers = [],
    updatedSpeakers = [],
    deletedSpeakersIds = []
  } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    // soft delete
    for (const id of deletedSpeakersIds) {
      await client.query(
        "UPDATE event_speakers SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND event_id = $2",
        [id, eventId]
      );
    }

    // update
    for (const speaker of updatedSpeakers) {
      await client.query(
        "UPDATE event_speakers SET name=$1, bio=$2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND event_id = $4",
        [speaker.name, speaker.bio, speaker.id, eventId]
      );
    }

    // insert new ticket
    for (const s of newSpeakers) {
      await client.query(
        "INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3)",
        [eventId, s.name, s.bio]
      );
    }

    const updatedSpeakersResult = await conn.query(
      "SELECT * FROM event_speakers WHERE event_id = $1 AND deleted_at IS NULL",
      [eventId]
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "speakers updated",
      speakers: updatedSpeakersResult.rows
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};
export const getEventSpeakers = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await conn.query(
      "SELECT name, bio FROM event_speakers WHERE event_id = $1 AND deleted_at IS NULL",
      [id]
    );
    return res.status(200).json({ success: true, speakers: result.rows });
  } catch (error) {
    return next(error);
  }
};

// event_categories table
export const addCategories = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { categories } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");
    const inserted = [];

    for (const c of categories) {
      const result = await client.query(
        "INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2) RETURNING *",
        [eventId, c.id]
      );
      inserted.push(result.rows[0]);
    }
    await client.query("COMMIT");
    return res.status(201).json(inserted);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};
export const updateCategories = async (req, res, next) => {
  const { id: eventId } = req.params;
  const { newCategories = [], deletedCategoriesIds = [] } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    // soft delete
    for (const id of deletedCategoriesIds) {
      await client.query(
        "UPDATE event_categories SET deleted_at = CURRENT_TIMESTAMP WHERE category_id = $1 AND event_id = $2",
        [id, eventId]
      );
    }

    // insert new categorise
    for (const s of newCategories) {
      await client.query(
        "INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)",
        [eventId, s.id]
      );
    }

    const updatedCategoriesResult = await conn.query(
      "SELECT c.* FROM categories c JOIN event_categories ec ON c.id = ec.category_id WHERE ec.event_id = $1 AND ec.deleted_at IS NULL",
      [eventId]
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      message: "categories updated",
      categories: updatedCategoriesResult.rows
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};
export const getEventCategories = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await conn.query(
      "SELECT c.id, c.name FROM event_categories ec JOIN categories c ON ec.category_id = c.id WHERE ec.event_id = $1 AND deleted_at IS NULL",
      [id]
    );
    return res.status(200).json({ success: true, categories: result.rows });
  } catch (error) {
    return next(error);
  }
};

// all catogories-categories table
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await conn.query(
      "SELECT id, name FROM categories Where deleted_at IS NULL"
    );
    return res.status(200).json({ success: true, allCategories: result.rows });
  } catch (error) {
    return next(error);
  }
};

// published events
export const updateEventStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const { userId } = req;

  try {
    const event = await conn.query(
      "SELECT * FROM events WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!event.rows.length) {
      return next(new CustomError("Event not found", 404));
    }

    if (status === "published") {
      const e = event.rows[0];
      const requiredFields = [
        e.title,
        e.description,
        e.location_type,
        e.start_datetime,
        e.end_datetime,
        e.duration,
        e.event_banner_url
      ];

      if (requiredFields.some((f) => !f)) {
        return next(new CustomError("Incomplete event data", 400));
      }

      const [cat, spk, tkt] = await Promise.all([
        conn.query("SELECT 1 FROM event_categories WHERE event_id = $1", [id]),
        conn.query("SELECT 1 FROM event_speakers WHERE event_id = $1", [id]),
        conn.query("SELECT 1 FROM tickets WHERE event_id = $1", [id])
      ]);

      if (!cat.rowCount || !spk.rowCount || !tkt.rowCount) {
        return next(
          new CustomError(
            "Event must have category, speaker, and ticket to publish",
            400
          )
        );
      }
    }

    const query =
      "UPDATE events SET status = $1, deleted_at = CASE WHEN $2 = 'cancelled' THEN CURRENT_TIMESTAMP ELSE deleted_at END WHERE id = $3 AND user_id = $4 RETURNING *";
    const result = await conn.query(query, [status, status, id, userId]);

    return res.status(200).json({
      success: true,
      message: `Event status updated to '${status}' successfully`,
      event: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllEventsByCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const query =
      "  SELECT e.id, e.title, e.description, e.start_datetime, e.location, p.first_name FROM events e JOIN profiles p ON p.user_id = e.user_id JOIN event_categories ec ON e.id = ec.event_id WHERE ec.category_id = $1 AND e.status = $2";

    const result = await conn.query(query, [id, "published"]);
    if (result.rows.length === 0) {
      return next(new CustomError("no published event", 404));
    }
    return res
      .status(200)
      .json({ success: true, data: result.rows, message: "published events" });
  } catch (error) {
    return next(error);
  }
};
// published event preview
export const getEventPreview = async (req, res, next) => {
  const { id } = req.params;

  try {
    const eventQuery = conn.query(
      "SELECT * FROM events WHERE id = $1 AND status = 'published'",
      [id]
    );
    const speakersQuery = conn.query(
      "SELECT name, bio FROM event_speakers WHERE event_id = $1 AND deleted_at IS NULL",
      [id]
    );
    const ticketsQuery = conn.query(
      "SELECT id, type, price, total_quantity, current_quantity, max_per_user FROM tickets WHERE event_id = $1 AND deleted_at IS NULL",
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
      success: true,
      event: eventResult.rows[0],
      speakers: speakersResult.rows,
      tickets: ticketsResult.rows,
      categories: categoriesResult.rows
    });
  } catch (error) {
    return next(error);
  }
};
// draft event
export const deleteDraftEvent = async (req, res, next) => {
  const { userId } = req;
  const { id } = req.params;

  try {
    const query =
      "UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND status = 'draft'  RETURNING *";
    const result = await conn.query(query, [id, userId]);

    if (result.rowCount === 0) {
      return next(
        new CustomError("Draft event not found or cannot be deleted", 404)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Draft event deleted successfully",
      event: result.rows[0]
    });
  } catch (error) {
    return next(error);
  }
};

// organizers-events by status
export const getEvents = async (req, res, next) => {
  const { userId } = req;
  const { status } = req.query;

  try {
    let query =
      "SELECT id, title, status, created_at FROM events WHERE user_id = $1 AND deleted_at IS NULL";
    const values = [userId];

    if (status) {
      query += " AND status = $2";
      values.push(status);
    }

    const result = await conn.query(query, values);

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: "events retrieved successfully"
    });
  } catch (error) {
    return next(error);
  }
};

// all published events
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
      .json({ success: true, data: result.rows, message: "published events" });
  } catch (error) {
    return next(error);
  }
};

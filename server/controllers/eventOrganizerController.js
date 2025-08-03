import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

// create only the title and category
export const createEvent = async (req, res, next) => {
  const client = await conn.connect();
  try {
    const { title, categoryIds } = req.body;
    const { userId } = req;

    await client.query("BEGIN");

    const eventResult = await client.query(
      `INSERT INTO events (user_id, title, status)
       VALUES ($1, $2, 'draft')
       RETURNING id, title, user_id, status`,
      [userId, title]
    );

    const event = eventResult.rows[0];
    if (categoryIds.length > 0) {
      for (const catId of categoryIds) {
        await client.query(
          `INSERT INTO event_categories (event_id, category_id)
           VALUES ($1, $2)`,
          [event.id, catId]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      data: {
        event
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

// get event inforamtion fro db
export const getEventDetails = async (req, res, next) => {
  const client = await conn.connect();
  try {
    const { id: eventId } = req.params;

    const eventResult = await client.query(
      `SELECT *
       FROM events
       WHERE id = $1`,
      [eventId]
    );
    const event = eventResult.rows[0];
    if (!event) {
      return next(new CustomError("event not found", 404));
    }

    const ticketResult = await client.query(
      `SELECT *
       FROM tickets
       WHERE event_id = $1 AND deleted_at IS NULL`,
      [eventId]
    );

    const speakerResult = await client.query(
      `SELECT *
       FROM event_speakers
       WHERE event_id = $1 AND deleted_at IS NULL`,
      [eventId]
    );

    return res.status(200).json({
      data: {
        event,
        tickets: ticketResult.rows,
        speakers: speakerResult.rows
      }
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
};

// update the event
export const updateEvent = async (req, res, next) => {
  const { id: eventId } = req.params; // event id
  const { userId } = req; // from auth middleware
  const { eventInfo = {}, speakers = [], tickets = [] } = req.body;
  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    //  Update event table
    const updateEventQuery = `
      UPDATE events SET
        title = $1,
        description = $2,
        location_type = $3,
        location = $4,
        start_datetime = $5,
        end_datetime = $6,
        duration = $7,
        event_banner_url = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND user_id = $10 AND deleted_at IS NULL
      RETURNING *;
    `;

    const updatedEventResult = await client.query(updateEventQuery, [
      eventInfo.title,
      eventInfo.description,
      eventInfo.locationType,
      eventInfo.location,
      eventInfo.startDateTime,
      eventInfo.endDateTime,
      eventInfo.duration,
      eventInfo.eventBannerUrl || null,
      eventId,
      userId
    ]);

    if (updatedEventResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return next(new CustomError("Event not found", 404));
    }

    // Helper function to soft delete removed records:
    async function softDeleteRemoved(table, idField, items) {
      // Get existing ids
      const existingRes = await client.query(
        `SELECT id FROM ${table} WHERE event_id = $1 AND deleted_at IS NULL`,
        [eventId]
      );
      const existingIds = existingRes.rows.map((r) => r.id);

      // IDs sent in payload (for update or add)
      const newIds = items.filter((item) => item.id).map((item) => item.id);

      // IDs to soft delete = existingIds - newIds
      const toDelete = existingIds.filter((id) => !newIds.includes(id));

      for (const id of toDelete) {
        await client.query(
          `UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND event_id = $2`,
          [id, eventId]
        );
      }
    }

    // delete speakers
    await softDeleteRemoved("event_speakers", "id", speakers);
    // Update and add new speakers
    for (const spk of speakers) {
      if (spk.id) {
        // Update existing speaker
        await client.query(
          `UPDATE event_speakers SET name = $1, bio = $2, photo_url=$3, updated_at = CURRENT_TIMESTAMP
           WHERE id = $4 AND event_id = $5`,
          [spk.name, spk.bio, spk.photoUrl, spk.id, eventId]
        );
      } else {
        // Insert new speaker
        await client.query(
          `INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3)`,
          [eventId, spk.name, spk.bio]
        );
      }
    }
    // delted tickets
    await softDeleteRemoved("tickets", "id", tickets);
    // Update amd add new tickets
    for (const tkt of tickets) {
      if (tkt.id) {
        // Update existing ticket
        await client.query(
          `UPDATE tickets SET type = $1, price = $2, total_quantity = $3, remaining_quantity = $4, max_per_user = $5, updated_at = CURRENT_TIMESTAMP
           WHERE id = $6 AND event_id = $7`,
          [
            tkt.type,
            tkt.price,
            tkt.totalQuantity,
            tkt.totalQuantity,
            tkt.maxPerUser ?? 1,
            tkt.id,
            eventId
          ]
        );
      } else {
        // Insert new ticket
        await client.query(
          `INSERT INTO tickets (event_id, type, price, total_quantity, remaining_quantity, max_per_user)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            eventId,
            tkt.type,
            tkt.price,
            tkt.totalQuantity,
            tkt.totalQuantity,
            tkt.maxPerUser ?? 1
          ]
        );
      }
    }
    const updatedSpeakersResult = await conn.query(
      "SELECT * FROM event_speakers WHERE event_id = $1 AND deleted_at IS NULL",
      [eventId]
    );
    const updatedTicketsResult = await client.query(
      "SELECT * FROM tickets WHERE event_id = $1 AND deleted_at IS NULL",
      [eventId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      data: {
        event: updatedEventResult.rows,
        speaker: updatedSpeakersResult.rows,
        tickets: updatedTicketsResult.rows
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

// list all categories table
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await conn.query(
      "SELECT id, name FROM categories Where deleted_at IS NULL"
    );
    return res.status(200).json({ data: { Categories: result.rows } });
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
    const event = await conn.query(
      "SELECT * FROM events WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!event.rows.length) {
      return next(new CustomError("Event not found", 404));
    }

    // If the user wants to publish the event, validate event completeness
    if (status === "published") {
      const e = event.rows[0];

      // Required event fields for publishing
      const requiredFields = [
        e.title,
        e.description,
        e.location_type,
        e.start_datetime,
        e.end_datetime,
        e.duration,
        e.event_banner_url
      ];

      // Check if any required field is missing
      if (requiredFields.some((f) => !f)) {
        return next(new CustomError("Incomplete event data", 400));
      }

      // Check if event has at least one category, speaker, and ticket before publishing
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

    // Update the event status
    // If status is 'cancelled', set deleted_at timestamp for soft delete
    // Otherwise update status yo published
    const query =
      "UPDATE events SET status = $1, deleted_at = CASE WHEN $2 = 'cancelled' THEN CURRENT_TIMESTAMP ELSE deleted_at END WHERE id = $3 AND user_id = $4 RETURNING *";
    const result = await conn.query(query, [status, status, id, userId]);

    return res.status(200).json({
      data: { event: result.rows[0] }
    });
  } catch (error) {
    return next(error);
  }
};

// deleted draft event
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
      data: { event: result.rows[0] }
    });
  } catch (error) {
    return next(error);
  }
};

// list organizers events by status(draft or published)
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
      data: { event: result.rows }
    });
  } catch (error) {
    return next(error);
  }
};

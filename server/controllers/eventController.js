import conn from "../db/db.js";

export const createEvent = async (req, res) => {
  const userId = req.userId;
  const {
    title,
    description,
    location_type,
    location,
    date,
    start_time,
    end_time,
    categories,
    tickets,
    speakers,
    status,
  } = req.body;

  try {
    if (status === "published") {
      if (
        !title ||
        !description ||
        !location_type ||
        !date ||
        !start_time ||
        !end_time ||
        !Array.isArray(speakers) ||
        speakers.length === 0 ||
        !Array.isArray(tickets) ||
        tickets.length === 0 ||
        !Array.isArray(categories) ||
        categories.length === 0
      ) {
        return res
          .status(400)
          .json({ success: false, message: "fields missing" });
      }

      if (location_type === "online" && !location) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Online URL required for online events",
          });
      }

      if (location_type === "venue" && !location) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Venue address required for venue events",
          });
      }

      const result = await conn.query(
        "INSERT INTO events (user_id,title, description, date, start_time, end_time,location_type, location, status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
        [
          userId,
          title,
          description,
          date,
          start_time,
          end_time,
          location_type,
          location,
          status,
        ]
      );

      const event = result.rows[0];

      await Promise.all(
        speakers.map((speaker) =>
          conn.query(
            "INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3)",
            [event.id, speaker.name, speaker.bio]
          )
        )
      );

      await Promise.all(
        tickets.map((ticket) =>
          conn.query(
            "INSERT INTO tickets (event_id, type, price, quantity) VALUES ($1, $2, $3, $4)",
            [event.id, ticket.type, ticket.price, ticket.quantity]
          )
        )
      );

      await Promise.all(
        categories.map((cat) =>
          conn.query(
            "INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)",
            [event.id, cat]
          )
        )
      );
      return res
        .status(200)
        .json({
          success: true,
          message: "event published",
          event_id: event.id,
        });
    }
    if (status === "draft") {
      if (
        title ||
        description ||
        location_type ||
        date ||
        start_time ||
        end_time
      ) {
        const result = await conn.query(
          "INSERT INTO events (user_id,title, description, date, start_time, end_time,location_type, location, status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
          [userId, title || "",description || "",date || null,start_time || null,end_time || null,  location_type || "", location || "",status,]);

        const event = result.rows[0];

        if (Array.isArray(speakers) && speakers.length > 0) {
          await Promise.all(
            speakers.map((speaker) =>
              conn.query(
                "INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3)",
                [event.id, speaker.name, speaker.bio]
              )
            )
          );
        }

        if (Array.isArray(tickets) && tickets.length > 0) {
          await Promise.all(
            tickets.map((ticket) =>
              conn.query(
                "INSERT INTO tickets (event_id, type, price, quantity) VALUES ($1, $2, $3, $4)",
                [event.id, ticket.type, ticket.price, ticket.quantity]
              )
            )
          );
        }

        if (Array.isArray(categories) && categories.length > 0) {
          await Promise.all(
            categories.map((cat) =>
              conn.query(
                "INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)",
                [event.id, cat]
              )
            )
          );
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: "no engough info for draft" });
      }

      return res.status(200).json({ success: true, message: "saved as draft" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDraftEvents = async (req, res) => {
  const userId = req.userId;
  try {
    const query =
      "SELECT id, title, created_at FROM events WHERE user_id = $1 AND status = $2";
    const result = await conn.query(query, [userId, "draft"]);

    const draftEvents = result.rows;

    return res
      .status(200)
      .json({
        success: true,
        data: draftEvents,
        message: "Draft events retrieved successfully",
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublishedEvents = async (req, res) => {
  const userId = req.userId;
  try {
    const query =
      "SELECT id, title, created_at FROM events WHERE user_id = $1 AND status = $2";
    const result = await conn.query(query, [userId, "published"]);

    const publishedEvents = result.rows;

    return res
      .status(200)
      .json({
        success: true,
        data: publishedEvents,
        message: "published events retrieved successfully",
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventInfo = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const eventQuery = `SELECT id, title, description, date, start_time, end_time, location_type, location, status FROM events WHERE user_id = $1 AND id = $2`;
    const eventResult = await conn.query(eventQuery, [userId, id]);
    const event = eventResult.rows[0];

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const speakerQuery = `SELECT id, name, bio FROM event_speakers WHERE event_id = $1`;
    const speakersResult = await conn.query(speakerQuery, [id]);

    const ticketQuery = `SELECT id, type, price, quantity FROM tickets WHERE event_id = $1`;
    const ticketsResult = await conn.query(ticketQuery, [id]);

    const categoryQuery = `SELECT c.id, c.name FROM categories c JOIN event_categories ec ON c.id = ec.category_id WHERE ec.event_id = $1`;
    const categoriesResult = await conn.query(categoryQuery, [id]);

    return res.status(200).json({
      success: true,
      data: {
        event: event,
        speakers: speakersResult.rows,
        tickets: ticketsResult.rows,
        categories: categoriesResult.rows,
      },
      message: "Event details retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const {
    title,
    description,
    location_type,
    location,
    date,
    start_time,
    end_time,
    categories = [],
    tickets = [],
    speakers = [],
    status,
    deletedSpeakerIds = [],
    deletedTicketIds = [],
    deletedCategoryIds = [],
  } = req.body;

  try {
    if (status === "published") {
      if (
        !title ||
        !description ||
        !location_type ||
        !location ||
        !date ||
        !start_time ||
        !end_time ||
        !Array.isArray(speakers) ||
        speakers.length === 0 ||
        !Array.isArray(tickets) ||
        tickets.length === 0 ||
        !Array.isArray(categories) ||
        categories.length === 0
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields required to publish" });
      }
    }

    const updateQuery = `
      UPDATE events SET
        title = $1,
        description = $2,
        location_type = $3,
        location = $4,
        date = $5,
        start_time = $6,
        end_time = $7,
        status = $8
      WHERE id = $9 AND user_id = $10
    `;
    await conn.query(updateQuery, [
      title,
      description,
      location_type,
      location,
      date,
      start_time,
      end_time,
      status,
      id,
      userId,
    ]);

    if (deletedSpeakerIds.length > 0) {
      await conn.query(`DELETE FROM event_speakers WHERE id = ANY($1)`, [
        deletedSpeakerIds,
      ]);
    }
    if (deletedTicketIds.length > 0) {
      await conn.query(`DELETE FROM tickets WHERE id = ANY($1)`, [
        deletedTicketIds,
      ]);
    }
    if (deletedCategoryIds.length > 0) {
      for (let catId of deletedCategoryIds) {
        await conn.query(
          `DELETE FROM event_categories WHERE event_id = $1 AND category_id = $2`,
          [id, catId]
        );
      }
    }

    for (let speaker of speakers) {
      if (speaker.id) {
        await conn.query(
          `UPDATE event_speakers SET name = $1, bio = $2 WHERE id = $3`,
          [speaker.name, speaker.bio, speaker.id]
        );
      } else {
        await conn.query(
          `INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3)`,
          [id, speaker.name, speaker.bio]
        );
      }
    }

    for (let ticket of tickets) {
      if (ticket.id) {
        await conn.query(
          `UPDATE tickets SET type = $1, price = $2, quantity = $3 WHERE id = $4`,
          [ticket.type, ticket.price, ticket.quantity, ticket.id]
        );
      } else {
        await conn.query(
          `INSERT INTO tickets (event_id, type, price, quantity) VALUES ($1, $2, $3, $4)`,
          [id, ticket.type, ticket.price, ticket.quantity]
        );
      }
    }

    for (let catId of categories) {
      const exists = await conn.query(
        `SELECT * FROM event_categories WHERE event_id = $1 AND category_id = $2`,
        [id, catId]
      );
      if (exists.rowCount === 0) {
        await conn.query(
          `INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)`,
          [id, catId]
        );
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelEvent = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const query = `UPDATE events SET status = $1 WHERE id = $2 AND user_id = $3 AND status = 'published'`;
    const result = await conn.query(query, ["cancelled", id, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Event not found or not publishable",
        });
    }

    return res
      .status(200)
      .json({ success: true, message: "Event cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDraftEvent = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const query = `DELETE FROM events WHERE id = $1 AND user_id = $2 AND status = 'draft'`;
    const result = await conn.query(query, [id, userId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Draft event not found or cannot be deleted",
        });
    }

    return res
      .status(200)
      .json({ success: true, message: "Draft event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

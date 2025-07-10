import conn from "../db/db.js";
import CustomError from "../utils/customError.js"

export const createEvent = async (req, res, next) => {
  const userId = req.userId; 
  const {
    title ,description , location_type, location , date , start_time , end_time  } = req.body;

  if( !title || !description || !location_type || !date || !start_time || !end_time || !location){
      return next(new CustomError("Required fields missing", 400));

    }
  try {
    const result = await conn.query(`INSERT INTO events (user_id, title, description, location_type, location,date, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft') RETURNING id`,[userId, title, description, location_type, location, date, start_time, end_time]);
    const eventId = result.rows[0].id;

    return res.status(201).json({success: true, message: "Draft created",event_id: eventId,});

  } catch (error) {
    next(error);
  }
};

export const updateEventInfo = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;
  const {title, description,location_type, location,date,start_time,end_time} = req.body;

  try {
    const result = await conn.query( `UPDATE events SET title = $1, description = $2, location_type = $3,location = $4, date = $5, start_time = $6, end_time = $7 WHERE id = $8 AND user_id = $9 RETURNING *`,
      [title, description, location_type, location, date, start_time, end_time, id, userId]);

    if (result.rowCount === 0) {
      return next(new CustomError("Event not found", 404));
    }

    return res.status(200).json({ success: true, message: "Event info updated", event: result.rows[0] });

  } catch (error) {
    next(error);
  }
};

export const updateSpeakers = async (req, res, next) => {
  const { id } = req.params;
  const { speakers } = req.body;

  if (!Array.isArray(speakers) || speakers.length===0) {
        return next(new CustomError("Speakers Required", 400));

  }
  const client = await conn.connect()
  try {
    await client.query('BEGIN')
    await client.query("DELETE FROM event_speakers WHERE event_id = $1", [id]);

    await Promise.all(
      speakers.map((s) =>
        client.query(
          "INSERT INTO event_speakers (event_id, name, bio) VALUES ($1, $2, $3)",
          [id, s.name, s.bio]
        )
      )
    );
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: "Speakers updated" });
  } catch (error) {
    await client.query('ROLLBACK')
    next(error);
  } finally{
    client.release();
  }
};

export const updateTickets = async (req, res, next) => {
  const { id } = req.params;
  const { tickets } = req.body;

  if (!Array.isArray(tickets) || tickets.length===0) {
    return next(new CustomError("tickets required", 400));
  }
  const client = await conn.connect()
  try {
    await client.query('BEGIN')
    await client.query("DELETE FROM tickets WHERE event_id = $1", [id]);

    await Promise.all(
      tickets.map((t) =>
        client.query(
          "INSERT INTO tickets (event_id, type, price, quantity, max_per_user) VALUES ($1, $2, $3, $4, $5)",
          [id, t.type, t.price, t.quantity, t.max_per_user ?? 1]
        )
      )
    );
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: "tickets updated" });
  } catch (error) {
    await client.query('ROLLBACK')
    next(error);
  } finally{
    client.release();
  }
};

export const updateCategories = async (req, res, next) => {
  const { id } = req.params;
  const { categories } = req.body;

  if (!Array.isArray(categories) || categories.length===0) {
    return next(new CustomError("categories required", 400));

  }
  const client = await conn.connect()
  try {
    await client.query('BEGIN')
    await client.query("DELETE FROM event_categories WHERE event_id = $1", [id]);

    await Promise.all(
      categories.map((c) =>
        client.query(
          "INSERT INTO event_categories (event_id, category_id) VALUES ($1, $2)",
            [id, c]
        )
      )
    );
    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: "categories updated" });
  } catch (error) {
    await client.query('ROLLBACK')
    next(error);
  } finally{
    client.release();
  }
};

export const publishEvent = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId
  try {
    const event = await conn.query("SELECT * FROM events WHERE id = $1 AND user_id=$2", [id, userId]);
    if (!event.rows.length) {
      return next(new CustomError("Event not found", 404));

    }

    const e = event.rows[0];
    const requiredFields = [e.title, e.description, e.location_type, e.date, e.start_time, e.end_time];
    if (requiredFields.some(f => !f)) {
          return next(new CustomError("Incomplete event data", 400));

    }

    const [cat, spk, tkt] = await Promise.all([
      conn.query("SELECT 1 FROM event_categories WHERE event_id = $1", [id]),
      conn.query("SELECT 1 FROM event_speakers WHERE event_id = $1", [id]),
      conn.query("SELECT 1 FROM tickets WHERE event_id = $1", [id])
    ]);

    if (!cat.rowCount || !spk.rowCount || !tkt.rowCount) {
      return next(new CustomError("Event must have category, speaker, and ticket to publish", 400));
    }

    await conn.query("UPDATE events SET status = 'published' WHERE id = $1 AND user_id=$2", [id, userId]);

    return res.status(200).json({ success: true, message: "Event published" });

  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const result = await conn.query(`SELECT title, description, location_type, location, date, start_time, end_time FROM events WHERE id = $1 AND user_id=$2`,[id, userId]);
    return res.status(200).json({ success: true, event: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getEventSpeakers = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await conn.query(`SELECT name, bio FROM event_speakers WHERE event_id = $1`,[id]);
    return res.status(200).json({ success: true, speakers: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await conn.query(`SELECT id, type, price, quantity, max_per_user FROM tickets WHERE event_id = $1`,[id]);
    return res.status(200).json({ success: true, tickets: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getEventCategories = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await conn.query(`SELECT c.id, c.name FROM event_categories ec JOIN categories c ON ec.category_id = c.id WHERE ec.event_id = $1`, [id]);
    return res.status(200).json({success: true, categories: result.rows});
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const result = await conn.query("SELECT id, name FROM categories");
    return res.status(200).json({ success: true, allCategories: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getDraftEvents = async (req, res, next) => {
  const userId = req.userId;
  try {
    const query = "SELECT id, title, status, created_at FROM events WHERE user_id = $1 AND status = $2";
    const result = await conn.query(query, [userId, "draft"]);

    const draftEvents = result.rows;

    return res.status(200).json({success: true,data: draftEvents,message: "Draft events retrieved successfully",});
  } catch (error) {
    next(error);
  }
};

export const getPublishedEvents = async (req, res, next) => {
  const userId = req.userId;
  try {
    const query ="SELECT id, title, status, created_at FROM events WHERE user_id = $1 AND status = $2";
    const result = await conn.query(query, [userId, "published"]);

    const publishedEvents = result.rows;

    return res.status(200).json({success: true, data: publishedEvents, message: "published events retrieved successfully",});
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const query = `UPDATE events SET status = $1 WHERE id = $2 AND user_id = $3 AND status = 'published'`;
    const result = await conn.query(query, ['cancelled', id, userId]);

    if (result.rowCount === 0) {
      return next(new CustomError("Event not found or not publishable", 404));
    }

    return res.status(200).json({ success: true, message: "Event cancelled successfully" });

  } catch (error) {
    next(error);
  }
};

export const deleteDraftEvent = async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const query = `DELETE FROM events WHERE id = $1 AND user_id = $2 AND status = 'draft'`;
    const result = await conn.query(query, [id, userId]);

    if (result.rowCount === 0) {
      return next(new CustomError("Draft event not found or cannot be deleted", 404));

    }

    return res.status(200).json({ success: true, message: "Draft event deleted successfully" });

  } catch (error) {
    next(error);
  }
};
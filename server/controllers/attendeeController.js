import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

export const eventRegister = async (req, res, next) => {
  const { userId } = req;
  const { ticketId, id: eventId } = req.params;
  const { registeredQuantity } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    const ticketQuery = `SELECT * FROM tickets WHERE id = $1 AND event_id = $2 AND deleted_at IS NULL`;
    const ticketResult = await client.query(ticketQuery, [ticketId, eventId]);
    const ticket = ticketResult.rows[0];

    if (!ticket) {
      return next(new CustomError("Ticket not found", 404));
    }

    if (registeredQuantity > ticket.remaining_quantity) {
      return next(new CustomError("Not enough tickets available", 400));
    }

    const countQuery = `
      SELECT COALESCE(SUM(registered_quantity), 0) AS total 
      FROM registrations 
      WHERE user_id = $1 AND ticket_type = $2 AND deleted_at IS NULL`;
    const countResult = await client.query(countQuery, [userId, ticketId]);
    const alreadyRegistered = parseInt(countResult.rows[0].total, 10);

    if (alreadyRegistered + registeredQuantity > ticket.max_per_user) {
      return next(
        new CustomError(
          `You can only register up to ${ticket.max_per_user} tickets.`,
          400
        )
      );
    }

    // Update remaining quantity
    await client.query(
      `UPDATE tickets 
       SET remaining_quantity = remaining_quantity - $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [registeredQuantity, ticketId]
    );

    // Insert registration
    const insertResult = await client.query(
      `INSERT INTO registrations (user_id, ticket_type, registered_quantity, event_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, ticketId, registeredQuantity, eventId]
    );

    await client.query("COMMIT");
    return res.status(200).json({
      data: { registration: insertResult.rows[0] }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

export const viewMyTickets = async (req, res, next) => {
  const { userId } = req;

  try {
    const query =
      "SELECT e.title, t.type, r.* FROM registrations r JOIN tickets t ON r.ticket_type = t.id JOIN events e ON t.event_id = e.id WHERE r.user_id = $1 AND r.deleted_at IS NULL AND t.deleted_at IS NULL AND e.deleted_at IS NULL";

    const result = await conn.query(query, [userId]);

    if (result.rows.length === 0) {
      return next(new CustomError("No tickets purchased", 404));
    }

    return res.status(200).json({
      data: { myTickets: result.rows }
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  const { userId } = req; // logged-in user
  const { registrationId } = req.params;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    // Fetch registration with ticket and event info
    const regRes = await client.query(
      `SELECT r.registered_quantity, r.user_id, t.id AS ticket_id, t.event_id, e.start_datetime
       FROM registrations r
       JOIN tickets t ON r.ticket_type = t.id
       JOIN events e ON t.event_id = e.id
       WHERE r.id = $1 AND r.deleted_at IS NULL`,
      [registrationId]
    );

    const registration = regRes.rows[0];

    if (!registration) {
      return next(new CustomError("Registration not found", 404));
    }

    // Check if the user owns this registration
    if (registration.user_id !== userId) {
      return next(
        new CustomError("Unauthorized to cancel this registration", 403)
      );
    }

    // Check event hasn't started
    const now = new Date();
    if (new Date(registration.start_datetime) <= now) {
      return next(
        new CustomError(
          "Cannot cancel registration after event has started",
          400
        )
      );
    }

    //  Soft delete registration
    await client.query(
      `UPDATE registrations 
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [registrationId]
    );

    // Increase ticket remaining_quantity
    await client.query(
      `UPDATE tickets 
       SET remaining_quantity = remaining_quantity + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [registration.registered_quantity, registration.ticket_id]
    );

    await client.query("COMMIT");

    return res.status(200).json();
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
};

export const getEventAttendees = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    // Fetch attendees for the event
    const result = await conn.query(
      `SELECT 
        p.first_name || ' ' || p.last_name AS full_name,
        u.email,
        t.type AS ticket_type,
        r.registered_quantity,
        r.registered_at
      FROM registrations r
      JOIN users u ON r.user_id = u.id AND u.deleted_at IS NULL
      JOIN profiles p ON p.user_id = u.id AND p.deleted_at IS NULL
      JOIN tickets t ON r.ticket_type = t.id AND t.deleted_at IS NULL
      WHERE r.event_id = $1 AND r.deleted_at IS NULL`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return next(new CustomError("no attendees", 404));
    }

    return res.status(200).json({
      data: {
        attendees: result.rows
      }
    });
  } catch (err) {
    return next(err);
  }
};

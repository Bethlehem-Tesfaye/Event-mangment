import conn from "../db/db.js";
import CustomError from "../utils/customError.js";

export const eventRegister = async (req, res, next) => {
  const { userId } = req;
  const { ticketId, id } = req.params;
  const { quantity } = req.body;

  const client = await conn.connect();
  try {
    await client.query("BEGIN");

    const ticketQuery =
      "SELECT t.total_quantity, t.max_per_user, t.event_id, e.title FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = $1 AND e.id = $2";

    const ticketResult = await client.query(ticketQuery, [ticketId, id]);
    const ticket = ticketResult.rows[0];
    if (!ticket) {
      await client.query("ROLLBACK");
      return next(new CustomError("Ticket not found", 404));
    }
    if (quantity <= 0) {
      await client.query("ROLLBACK");
      return next(new CustomError("Quantity must be greater than 0", 400));
    }

    const countQuery =
      "SELECT COALESCE(SUM(quantity), 0) AS total FROM registrations WHERE user_id = $1 AND ticket_id = $2";
    const countResult = await client.query(countQuery, [userId, ticketId]);
    const alreadyPurchased = parseInt(countResult.rows[0].total, 10);

    if (alreadyPurchased + quantity > ticket.max_per_user) {
      await client.query("ROLLBACK");
      return next(
        new CustomError(
          `You can only buy up to ${ticket.max_per_user} tickets.`,
          400
        )
      );
    }
    if (ticket.total_quantity < quantity) {
      await client.query("ROLLBACK");
      return next(new CustomError("Not enough tickets available", 400));
    }

    await client.query(
      "UPDATE tickets SET current_quantity = current_quantity - $1 WHERE id = $2",
      [quantity, ticketId]
    );

    await client.query(
      "INSERT INTO registrations (user_id, ticket_id, quantity) VALUES ($1, $2, $3)",
      [userId, ticketId, quantity]
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      event: { id: ticket.event_id, title: ticket.title },
      message: "Ticket purchased successfully"
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
      "SELECT e.title, t.type, r.quantity FROM registrations r JOIN tickets t ON r.ticket_id = t.id JOIN events e ON t.event_id = e.id WHERE r.user_id = $1";

    const result = await conn.query(query, [userId]);

    if (result.rows.length === 0) {
      return next(new CustomError("No tickets purchased", 404));
    }

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: "Purchased tickets retrieved successfully"
    });
  } catch (error) {
    return next(error);
  }
};

export const viewAttendeesForMyEvents = async (req, res, next) => {
  const organizerId = req.userId;

  try {
    const query =
      " SELECT e.id AS event_id, e.title AS event_title, p.first_name AS attendee_first_name, t.type AS ticket_type, r.quantity FROM events e JOIN tickets t ON e.id = t.event_id JOIN registrations r ON r.ticket_id = t.id JOIN users u ON u.id = r.user_id JOIN profiles p ON p.user_id = u.id WHERE e.user_id = $1 ORDER BY e.id";

    const result = await conn.query(query, [organizerId]);

    const grouped = [];

    result.rows.forEach((row) => {
      const existing = grouped.find((g) => g.event_id === row.event_id);

      const attendee = {
        first_name: row.attendee_first_name,
        ticket_type: row.ticket_type,
        quantity: row.quantity
      };

      if (existing) {
        existing.attendees.push(attendee);
      } else {
        grouped.push({
          event_id: row.event_id,
          event_title: row.event_title,
          attendees: [attendee]
        });
      }
    });

    return res
      .status(200)
      .json({ success: true, data: grouped, message: "Attendees per event" });
  } catch (error) {
    return next(error);
  }
};

import conn from "../db/db.js"
import CustomError from "../utils/customError.js";

export const getAllEvents =async(req,res,next)=>{
    try {
       const query = `SELECT e.id, e.title, e.description, e.date, e.location, p.first_name FROM events e JOIN profiles p ON p.user_id = e.user_id WHERE e.status = $1`;


        const result = await conn.query(query,['published'])
        if(result.rows.length===0){
          return next(new CustomError("no published event", 404));

        }
        return res.status(200).json({success:true, data:result.rows, message:"published events"})

    } catch (error) {
      next(error);
    }
}
export const getAllEventsByCategory =async(req,res, next)=>{
  const {id} = req.params;

    try {
       const query = `  SELECT e.id, e.title, e.description, e.date, e.location, p.first_name FROM events e JOIN profiles p ON p.user_id = e.user_id JOIN event_categories ec ON e.id = ec.event_id WHERE ec.category_id = $1 AND e.status = $2`;

        const result = await conn.query(query,[id, 'published'])
        if(result.rows.length===0){
          return next(new CustomError("no published event", 404));

        }
        return res.status(200).json({success:true, data:result.rows, message:"published events"})

    } catch (error) {
      next(error);
    }
}

export const getEventPreview = async (req, res,next) => {
  const { id } = req.params;

  try {
    const eventQuery = conn.query(`SELECT * FROM events WHERE id = $1 AND status = 'published'`, [id]);
    const speakersQuery = conn.query(`SELECT name, bio FROM event_speakers WHERE event_id = $1`, [id]);
    const ticketsQuery = conn.query(`SELECT id, type, price, quantity FROM tickets WHERE event_id = $1`, [id]);
    const categoriesQuery = conn.query(`SELECT c.id, c.name FROM event_categories ec JOIN categories c ON ec.category_id = c.id WHERE ec.event_id = $1`, [id]);

    const [eventResult, speakersResult, ticketsResult, categoriesResult] = await Promise.all([
      eventQuery, speakersQuery, ticketsQuery, categoriesQuery
    ]);

    if (eventResult.rows.length===0) {
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
    next(error);
  }
};

export const eventRegister = async (req, res, next) => {
  const userId = req.userId;
  const { ticketId } = req.params;
  const { quantity } = req.body;

  const client = await conn.connect()
  try {
    await client.query('BEGIN')

    const ticketQuery = 'SELECT t.quantity, t.max_per_user, t.event_id, e.title FROM tickets t JOIN events e ON t.event_id = e.id WHERE t.id = $1';

    const ticketResult = await client.query(ticketQuery, [ticketId]);
    const ticket = ticketResult.rows[0];
    if (!ticket) {
      await client.query('ROLLBACK');
      return next(new CustomError("Ticket not found", 404));

    }
    if (quantity <= 0) {
      await client.query('ROLLBACK');
      return next(new CustomError("Quantity must be greater than 0", 400));

    }

    const countQuery = 'SELECT COALESCE(SUM(quantity), 0) AS total FROM registrations WHERE user_id = $1 AND ticket_id = $2';
    const countResult = await client.query(countQuery, [userId, ticketId]);
    const alreadyPurchased = parseInt(countResult.rows[0].total);

    if ((alreadyPurchased + quantity) > ticket.max_per_user) {
      await client.query('ROLLBACK');
      return next(new CustomError(`You can only buy up to ${ticket.max_per_user} tickets.`, 400));
    }
    if (ticket.quantity < quantity) {
      await client.query('ROLLBACK');
      return next(new CustomError("Not enough tickets available", 400));
    }

    await client.query(
      'UPDATE tickets SET quantity = quantity - $1 WHERE id = $2',
      [quantity, ticketId]
    );

    await client.query(
      'INSERT INTO registrations (user_id, ticket_id, quantity) VALUES ($1, $2, $3)',
      [userId, ticketId, quantity]
    );

    await client.query('COMMIT');
    return res.status(200).json({ success: true,event: {id: ticket.event_id,title: ticket.title}, message: 'Ticket purchased successfully' });
  } catch (error) {
      await client.query('ROLLBACK')
      next(error);
  } finally{
    client.release()
  }
}

export const viewMyTickets = async (req, res, next) => {
  const userId = req.userId;

  try {
    const query = `SELECT e.title, t.type, r.quantity FROM registrations r JOIN tickets t ON r.ticket_id = t.id JOIN events e ON t.event_id = e.id WHERE r.user_id = $1`;

    const result = await conn.query(query, [userId]);

    if (result.rows.length === 0) {
      return next(new CustomError("No tickets purchased", 404));
    }

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Purchased tickets retrieved successfully'
    });

  } catch (error) {
    next(error);
  }
};

export const viewAttendeesForMyEvents = async (req, res, next) => { 
  const organizerId = req.userId;

  try {
    const query = ` SELECT e.id AS event_id, e.title AS event_title, p.first_name AS attendee_first_name, t.type AS ticket_type, r.quantity FROM events e JOIN tickets t ON e.id = t.event_id JOIN registrations r ON r.ticket_id = t.id JOIN users u ON u.id = r.user_id JOIN profiles p ON p.user_id = u.id WHERE e.user_id = $1 ORDER BY e.id`;

    const result = await conn.query(query, [organizerId]);

    const grouped = [];

    for (const row of result.rows) {
      const existing = grouped.find(g => g.event_id === row.event_id);

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
    }

    return res.status(200).json({ success: true, data: grouped, message: "Attendees per event" });
  } catch (error) {
    next(error);

  }
};



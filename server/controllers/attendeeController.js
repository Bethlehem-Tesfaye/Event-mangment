import conn from "../db/db.js"


export const getAllEvents =async(req,res)=>{
    try {
        const query = 'SELECT e.title ,e.description, e.date, e.location, u.name FROM events e JOIN users u ON u.id= e.user_id WHERE e.status=$1'

        const result = await conn.query(query,['published'])
        if(result.rows.length===0){
            return res.status(404).json({success:false, message:"no published event"})
        }

        return res.status(200).json({success:true, data:result.rows, message:"published events"})


    } catch (error) {
            return res.status(500).json({success:false, message:error.message})
        
    }
}

export const getEventInfo = async (req, res) => {
    const { id } = req.params;

    try {
        const eventQuery = `SELECT id, title, description, date, start_time, end_time, location_type, location, status FROM events WHERE id = $1AND status = 'published'
`;
        const eventResult = await conn.query(eventQuery, [id]);
        const event = eventResult.rows[0];

        if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
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
            event:event,
            speakers: speakersResult.rows,
            tickets: ticketsResult.rows,
            categories: categoriesResult.rows,
        },
        message: "Event details retrieved successfully"
        });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const eventRegister = async (req, res) => {
  const userId = req.userId;
  const { ticketId } = req.params;
  const { quantity } = req.body;

  try {
    const ticketQuery = 'SELECT quantity FROM tickets WHERE id = $1';
    const ticketResult = await conn.query(ticketQuery, [ticketId]);
    const ticket = ticketResult.rows[0];

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough tickets available' });
    }

    await conn.query(
      'UPDATE tickets SET quantity = quantity - $1 WHERE id = $2',
      [quantity, ticketId]
    );

    await conn.query(
      'INSERT INTO registrations (user_id, ticket_id, quantity) VALUES ($1, $2, $3)',
      [userId, ticketId, quantity]
    );

    return res.status(200).json({ success: true, message: 'Ticket purchased successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export const viewMyTickets = async (req, res) => {
  const userId = req.userId;

  try {
    const query = `SELECT e.title, t.type, r.quantity FROM registrations r JOIN tickets t ON r.ticket_id = t.id JOIN events e ON t.event_id = e.id WHERE r.user_id = $1`;

    const result = await conn.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No tickets purchased' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Purchased tickets retrieved successfully'
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const viewBuyersForMyEvents = async (req, res) => {
  const organizerId = req.userId;

  try {
    const query = `SELECT e.id AS event_id, e.title AS event_title, u.id AS user_id, u.name AS user_name, u.email AS user_email,t.type AS ticket_type, r.quantityFROM events e JOIN tickets t ON e.id = t.event_id  JOIN registrations r ON r.ticket_id = t.id JOIN users u ON u.id = r.user_id WHERE e.user_id = $1 ORDER BY e.id`;

    const result = await conn.query(query, [organizerId]);

    const grouped = [];

    for (const row of result.rows) {
      const existing = grouped.find(g => g.event_id === row.event_id);

      const attendee = {
        name: row.user_name,
        email: row.user_email,
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

    return res.status(200).json({ success: true, data: grouped, message: "Buyers per event" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


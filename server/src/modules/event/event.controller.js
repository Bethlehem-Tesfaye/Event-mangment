import { Parser } from "json2csv";
import * as eventService from "./event.service.js";

export const listEvents = async (req, res, next) => {
  const { limit, offset, search, category } = req.query;

  try {
    const events = await eventService.getEvents({
      limit,
      offset,
      search,
      categoryName: category
    });

    return res.status(200).json({ data: events });
  } catch (err) {
    return next(err);
  }
};

export const getEventDetails = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const event = await eventService.getEventById(eventId);
    return res.status(200).json({ event });
  } catch (err) {
    return next(err);
  }
};

export const getEventSpeakers = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const speakers = await eventService.getEventSpeakers(eventId);
    return res.status(200).json({ data: speakers });
  } catch (err) {
    return next(err);
  }
};

export const getEventTickets = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const tickets = await eventService.getEventTickets(eventId);
    return res.status(200).json({ data: tickets });
  } catch (err) {
    return next(err);
  }
};

export const purchaseTicket = async (req, res, next) => {
  const { eventId } = req.params;
  const { ticketId, attendeeName, attendeeEmail, quantity } = req.body;
  const userId = req.userId || null;

  try {
    const registration = await eventService.purchaseTicket({
      eventId,
      ticketId,
      userId,
      attendeeName,
      attendeeEmail,
      quantity: parseInt(quantity, 10)
    });

    return res.status(201).json({
      data: registration
    });
  } catch (err) {
    return next(err);
  }
};

//
export const createEvent = async (req, res, next) => {
  try {
    const { userId } = req;
    const eventCreated = await eventService.createEvent({
      userId,
      ...req.body
    });
    return res.status(201).json({ data: eventCreated });
  } catch (err) {
    return next(err);
  }
};

export const getEventDetailById = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventDetailById(eventId);
    return res.status(200).json({ data: event });
  } catch (err) {
    return next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { userId } = req;
    const { status } = req.query;
    const updatedEvent = await eventService.updateEvent(eventId, userId, {
      ...req.body,
      status
    });
    return res.status(200).json({ data: { event: updatedEvent } });
  } catch (err) {
    return next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const deletedEvent = await eventService.deleteEvent(eventId);
    return res.status(200).json({ data: deletedEvent });
  } catch (err) {
    return next(err);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const ticket = await eventService.createTicket({ eventId, ...req.body });
    return res.status(201).json({ data: ticket });
  } catch (err) {
    return next(err);
  }
};

export const getTicketsForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const tickets = await eventService.getTicketsForEvent(eventId);
    return res.status(200).json({ data: tickets });
  } catch (err) {
    return next(err);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const updatedTicket = await eventService.updateTicket(ticketId, req.body);
    return res.status(200).json({ data: updatedTicket });
  } catch (err) {
    return next(err);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const deletedTicket = await eventService.deleteTicket(ticketId);
    return res.status(200).json({ data: deletedTicket });
  } catch (err) {
    return next(err);
  }
};

export const createSpeaker = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const speaker = await eventService.createSpeaker({ eventId, ...req.body });
    return res.status(201).json({ data: speaker });
  } catch (err) {
    return next(err);
  }
};

export const getSpeakersForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const speakers = await eventService.getSpeakersForEvent(eventId);
    return res.status(200).json({ data: speakers });
  } catch (err) {
    return next(err);
  }
};

export const updateSpeaker = async (req, res, next) => {
  try {
    const { speakerId } = req.params;
    const updatedSpeaker = await eventService.updateSpeaker(
      speakerId,
      req.body
    );
    return res.status(200).json({ data: updatedSpeaker });
  } catch (err) {
    return next(err);
  }
};

export const deleteSpeaker = async (req, res, next) => {
  try {
    const { speakerId } = req.params;
    const deletedSpeaker = await eventService.deleteSpeaker(speakerId);
    return res.status(200).json({ data: deletedSpeaker });
  } catch (err) {
    return next(err);
  }
};

export const addCategoryToEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { categoryId } = req.body;
    const category = await eventService.addCategoryToEvent({
      eventId,
      categoryId
    });
    return res.status(201).json({ data: category });
  } catch (err) {
    return next(err);
  }
};

export const removeCategoryFromEvent = async (req, res, next) => {
  try {
    const { eventId, categoryId } = req.params;
    const removedCategory = await eventService.removeCategoryFromEvent({
      eventId,
      categoryId
    });
    return res.status(200).json({ data: removedCategory });
  } catch (err) {
    return next(err);
  }
};

export const getEventAttendees = async (req, res, next) => {
  const { eventId } = req.params;
  const { format } = req.query;

  try {
    const attendees = await eventService.getEventAttendeesService(eventId);

    if (format === "csv") {
      const fields = [
        "full_name",
        "email",
        "ticket_type",
        "registered_quantity",
        "registered_at"
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(attendees);

      res.header("Content-Type", "text/csv");
      res.attachment(`event-${eventId}-attendees.csv`);
      return res.send(csv);
    }

    return res.status(200).json({ data: { attendees } });
  } catch (err) {
    return next(err);
  }
};

export const getEventAnalytics = async (req, res, next) => {
  const { eventId } = req.params;
  const { userId } = req;

  try {
    const analytics = await eventService.getEventAnalytics(eventId, userId);
    return res.status(200).json({ data: analytics });
  } catch (err) {
    return next(err);
  }
};

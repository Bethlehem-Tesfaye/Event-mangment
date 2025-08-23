import * as ticketService from "./ticket.service.js";

export const createTicket = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const ticket = await ticketService.createTicket({ eventId, ...req.body });
    return res.status(201).json({ data: ticket });
  } catch (err) {
    return next(err);
  }
};

export const getTicketsForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const tickets = await ticketService.getTicketsForEvent(eventId);
    return res.status(200).json({ data: tickets });
  } catch (err) {
    return next(err);
  }
};

export const getPublicTicketsForEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const tickets = await ticketService.getTicketsForEvent(eventId);
    return res.status(200).json({ data: tickets });
  } catch (err) {
    return next(err);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const updatedTicket = await ticketService.updateTicket(ticketId, req.body);
    return res.status(200).json({ data: updatedTicket });
  } catch (err) {
    return next(err);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const deletedTicket = await ticketService.deleteTicket(ticketId);
    return res.status(200).json({ data: deletedTicket });
  } catch (err) {
    return next(err);
  }
};

export const getUserTicketHistory = async (req, res, next) => {
  try {
    const { userId } = req;
    const history = await ticketService.getUserTicketHistory(userId);
    return res.status(200).json({ data: history });
  } catch (err) {
    return next(err);
  }
};

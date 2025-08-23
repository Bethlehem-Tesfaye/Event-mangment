import * as speakerService from "./speaker.service.js";

export const createSpeaker = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const speaker = await speakerService.createSpeaker({
      eventId,
      ...req.body
    });
    return res.status(201).json({ data: speaker });
  } catch (err) {
    return next(err);
  }
};

export const getSpeakersForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const speakers = await speakerService.getSpeakersForEvent(eventId);
    return res.status(200).json({ data: speakers });
  } catch (err) {
    return next(err);
  }
};

export const getPublicSpealersForEvent = async (req, res, next) => {
  const { eventId } = req.params;

  try {
    const speakers = await speakerService.getSpeakersForEvent(eventId);
    return res.status(200).json({ data: speakers });
  } catch (err) {
    return next(err);
  }
};

export const updateSpeaker = async (req, res, next) => {
  try {
    const { speakerId } = req.params;
    const updatedSpeaker = await speakerService.updateSpeaker(
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
    const deletedSpeaker = await speakerService.deleteSpeaker(speakerId);
    return res.status(200).json({ data: deletedSpeaker });
  } catch (err) {
    return next(err);
  }
};

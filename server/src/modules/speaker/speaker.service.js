import prisma from "../../lib/prisma.js";
import CustomError from "../../utils/customError.js";

// Create speaker for event
export const createSpeaker = async ({ eventId, name, bio, photoUrl }) => {
  const speaker = await prisma.eventSpeaker.create({
    data: { eventId: parseInt(eventId, 10), name, bio, photoUrl }
  });
  return speaker;
};

// Update speaker
export const updateSpeaker = async (speakerId, data) => {
  const speaker = await prisma.eventSpeaker.update({
    where: { id: parseInt(speakerId, 10) },
    data: { ...data, updatedAt: new Date() }
  });
  return speaker;
};

export const getSpeakersForEvent = async (eventId) => {
  const speakers = await prisma.eventSpeaker.findMany({
    where: { eventId: parseInt(eventId, 10), deletedAt: null },
    select: { id: true, name: true, bio: true, photoUrl: true }
  });

  if (speakers.length === 0)
    throw new CustomError("No speakers found for this event", 404);

  return speakers;
};

export const deleteSpeaker = async (speakerId) => {
  return prisma.eventSpeaker.update({
    where: { id: parseInt(speakerId, 10) },
    data: { deletedAt: new Date() }
  });
};

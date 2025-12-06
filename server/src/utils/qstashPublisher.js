/* eslint-disable no-console */
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN
});

export const publishEmailJob = async (payload) => {
  try {
    const res = await qstash.publishJSON({
      url: process.env.EMAIL_API_URL,
      body: payload
    });

    console.log("QStash publish success:", res);
    return res;
  } catch (err) {
    console.error("QStash publish error:", err);
    throw err;
  }
};

export const publishReminderJob = async (payload) => {
  try {
    const eventDate = payload.eventDate ? new Date(payload.eventDate) : null;
    const now = new Date();

    let delaySeconds = 10;

    if (eventDate && !Number.isNaN(eventDate.getTime())) {
      // target is 24 hours before event
      const diffMs = eventDate - now - 24 * 60 * 60 * 1000;
      delaySeconds = Math.max(Math.floor(diffMs / 1000), 10);
    }
    // FOR DEVELOPMENT TESTING use short delay (30s)
    const delay = process.env.NODE_ENV === "development" ? "30s" : "30s";

    const res = await qstash.publishJSON({
      url: process.env.REMINDER_API_URL,
      body: payload,
      delay
    });

    console.log("QStash reminder publish success:", res, "delay=", delay);
    return res;
  } catch (err) {
    console.error("QStash publish reminder error:", err);
    throw err;
  }
};

export default { publishEmailJob, publishReminderJob };

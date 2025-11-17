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

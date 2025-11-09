export const publishEmailJob = async (payload) => {
  const res = await fetch(process.env.WORKFLOW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Upstash-Authorization": `Bearer ${process.env.QSTASH_TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  return res.json();
};

import dotenv from "dotenv";
dotenv.config();

import transporter from "./mailer.js";

console.log(
  "RESEND_API_KEY (masked):",
  process.env.RESEND_API_KEY
    ? `${process.env.RESEND_API_KEY.slice(0, 4)}...${process.env.RESEND_API_KEY.slice(-4)}`
    : "NOT SET"
);

(async () => {
  try {
    const res = await transporter.sendMail({
      to: "bettyxbooksx@gmail.com", // <-- replace with your address
      subject: "Resend API test " + new Date().toISOString(),
      html: "<p>Server test message</p>"
    });

    console.log("sendTest response:", JSON.stringify(res, null, 2));
    console.log(
      "message id (search in dashboard):",
      res?.data?.id ?? res?.id ?? "no-id"
    );
  } catch (err) {
    console.error("sendTest error:", err);
  }
})();

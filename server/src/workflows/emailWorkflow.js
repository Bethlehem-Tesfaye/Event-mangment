/* eslint-disable no-console */

import { serve } from "@upstash/workflow/express";
import transporter from "../lib/mailer.js";
import { VerifyTemplate } from "../lib/email/template/VerifyTemplate.js";
import { ResetTemplate } from "../lib/email/template/ResetTemplate.js";

export const emailWorkflow = serve(async (context) => {
  console.log("Headers:", context.requestHeaders);
  const payload = context.requestPayload;
  console.log("Workflow triggered with payload:", payload);

  if (payload.type === "verification") {
    const html = VerifyTemplate({
      username: payload.username,
      url: payload.url
    });

    await transporter.sendMail({
      to: payload.email,
      subject: "Verify your email",
      html
    });
  }

  if (payload.type === "reset") {
    const html = ResetTemplate({
      username: payload.username,
      url: payload.url
    });

    await transporter.sendMail({
      to: payload.email,
      subject: "Reset your password",
      html
    });
  }

  if (payload.type === "ticket") {
    await transporter.sendMail({
      to: payload.email,
      subject: `🎟 Your Ticket`,
      html: `
        <p>Hello ${payload.attendeeName}, here’s your ticket!</p>
        <img src="cid:ticketqr" />
      `,
      attachments: [
        {
          filename: "ticket.png",
          path: payload.qrPath,
          cid: "ticketqr"
        }
      ]
    });
  }

  return { ok: true };
});

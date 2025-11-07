export function ResetTemplate({ username, url }) {
  const primary = "#fc0356";
  const popoverFg = "#0d0c0c";

  return `
  <div style="
    background: #f7f7f7;
    padding: 40px 0;
    font-family: Arial, sans-serif;
    color: ${popoverFg};
  ">
    <div style="
      max-width: 480px;
      margin: auto;
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    ">
      
      <h2 style="
        margin-top: 0;
        font-size: 24px;
        font-weight: 600;
        color: ${popoverFg};
      ">
        Reset Your Password
      </h2>

      <p style="font-size: 15px;">
        Hello <strong>${username}</strong>,
      </p>

      <p style="font-size: 15px;">
        You requested a password reset. Click the button below to set a new password:
      </p>

      <a href="${url}" style="
        display: inline-block;
        padding: 12px 20px;
        background: ${primary};
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 16px;
        margin: 24px 0;
      ">
        Reset Password
      </a>

      <p style="font-size: 13px; color: #555; line-height: 1.5;">
        If you didn’t request this, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

      <p style="font-size: 12px; color: #999; text-align: center;">
        Your App Name — Security First.
      </p>
    </div>
  </div>
  `;
}

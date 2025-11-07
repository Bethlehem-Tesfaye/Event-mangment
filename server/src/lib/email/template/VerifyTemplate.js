export function VerifyTemplate({ username, url }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>

  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 0 !important;
      }
      .content {
        padding: 20px !important;
      }
      .btn {
        width: 100% !important;
        display: block !important;
        text-align: center !important;
      }
      h2 {
        font-size: 20px !important;
      }
      p {
        font-size: 14px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:#f4f4f7;">

  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:40px 0;">
    <tr>
      <td align="center">

        <table class="container" width="600" cellpadding="0" cellspacing="0" 
               style="background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#fc0356; padding:30px 0; text-align:center;">
              <div style="
                width:60px;
                height:60px;
                border-radius:50%;
                background:#ffffff;
                margin:auto;
                font-size:24px;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#fc0356;
              ">✉️</div>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding:40px; font-family:Arial, sans-serif;">

              <h2 style="margin-top:0; font-size:24px; color:#0d0c0c;">Email Verification</h2>

              <p style="font-size:15px; color:#333; line-height:1.6;">
                Hi <strong>${username}</strong>,
              </p>

              <p style="font-size:15px; color:#333; line-height:1.6;">
                You're almost ready to start using our app. Click the button below to verify your email address.
              </p>

              <p style="font-size:14px; color:#555; margin-top:20px;">
                The link expires in 1 hour.
              </p>

              <a class="btn" href="${url}" 
                style="
                  display:block;
                  width:fit-content;
                  margin:30px auto;
                  padding:14px 30px;
                  background:#fc0356;
                  color:white;
                  border-radius:6px;
                  font-size:16px;
                  font-weight:bold;
                  text-decoration:none;
                ">
                Verify my email address
              </a>

              <hr style="border:none; border-top:1px solid #eee; margin:40px 0 20px;" />

              <p style="text-align:center; font-size:12px; color:#999;">
                EventLight
              </p>

              <p style="text-align:center; font-size:12px; color:#999; margin-top:10px;">
                | Privacy Policy | Contact |
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}

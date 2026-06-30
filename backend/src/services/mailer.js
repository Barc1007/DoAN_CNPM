console.log('[mailer] VERSION: ipv4-fix-v2', new Date().toISOString());
const nodemailer = require('nodemailer');
let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('[mailer] SMTP_USER / SMTP_PASS chua duoc cau hinh trong .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
};

const formatHtml = (otp, fullName) => {
  const fromName = process.env.SMTP_FROM_NAME || 'StudentMoney';
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dat lai mat khau</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 16px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:#4ECDC4;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">
                ${fromName}
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Ma xac minh dat lai mat khau
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;color:#333333;line-height:1.6;">
                Xin chao <strong>${fullName || 'ban'}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.6;">
                Chung toi da nhan duoc yeu cau dat lai mat khau cho tai khoan cua ban.
                Vui long su dung ma xac minh ben duoi de tiep tuc:
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0 24px;">
                    <div style="
                      display:inline-block;
                      background:#f0fdfb;
                      border:2px solid #4ECDC4;
                      border-radius:8px;
                      padding:16px 32px;
                    ">
                      <span style="
                        font-size:32px;
                        font-weight:bold;
                        color:#4ECDC4;
                        letter-spacing:8px;
                        font-family:'Courier New',Courier,monospace;
                      ">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:14px;color:#555555;line-height:1.5;">
                Ma nay co hieu luc trong <strong>10 phut</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.5;">
                Neu ban khong yeu cau dat lai mat khau, vui long bo qua email nay.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px;"/>

              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;">
                Email nay duoc gui tu ${fromName}. Neu ban gap van de, vui long
                lien he qua kenh ho tro cua chung toi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

const sendOtpEmail = async ({ to, otp, fullName }) => {
  const tp = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || 'StudentMoney';

  if (!tp) {
    console.log('\n[mailer] Fallback dev — in OTP ra console:');
    console.log(`  To  : ${to}`);
    console.log(`  OTP : ${otp}`);
    console.log('  (Cau hinh SMTP_USER / SMTP_PASS trong .env de gui email that)\n');
    return;
  }

  try {
    await tp.sendMail({
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `Ma xac minh dat lai mat khau - ${fromName}`,
      html: formatHtml(otp, fullName),
    });
    console.log(`[mailer] Email gui thanh cong toi ${to}`);
  } catch (err) {
    console.error('[mailer] Loi gui email:', err.message);
  }
};

module.exports = { sendOtpEmail };

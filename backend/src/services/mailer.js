const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const formatHtml = (otp, fullName) => {
  const fromName = process.env.SMTP_FROM_NAME || 'StudentMoney';
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Đặt lại mật khẩu</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 16px rgba(0,0,0,0.10);">
          <tr>
            <td style="background:#4ECDC4;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">
                ${fromName}
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Mã xác minh đặt lại mật khẩu
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;color:#333333;line-height:1.6;">
                Xin chào <strong>${fullName || 'bạn'}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#333333;line-height:1.6;">
                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                Vui lòng sử dụng mã xác minh bên dưới để tiếp tục:
              </p>
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
                Mã này có hiệu lực trong <strong>10 phút</strong>.
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.5;">
                Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
              </p>
              <hr style="border:none;border-top:1px solid #eeeeee;margin:0 0 24px;"/>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;">
                Email này được gửi từ ${fromName}. Nếu bạn gặp vấn đề, vui lòng
                liên hệ chúng tôi.
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
  const fromName = process.env.SMTP_FROM_NAME || 'StudentMoney';

  try {
    const { error } = await resend.emails.send({
      from: `${fromName} <onboarding@resend.dev>`,
      to,
      subject: `Mã xác minh đặt lại mật khẩu - ${fromName}`,
      html: formatHtml(otp, fullName),
    });

    if (error) {
      console.error('[mailer] Resend error:', error);
      throw new Error(error.message || 'Gửi email thất bại');
    }

    console.log(`[mailer] Email gửi thành công tới ${to}`);
  } catch (err) {
    console.error('[mailer] Lỗi gửi email:', err.message);
    throw err;
  }
};

module.exports = { sendOtpEmail };
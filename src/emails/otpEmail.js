export const otpEmail = (otp, name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Chattify</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

  <div style="max-width:520px; margin:40px auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- Header with Logo -->
    <div style="background:#111827; padding:20px; text-align:center;">
      <img src="https://res.cloudinary.com/falcon1996/image/upload/q_auto/f_auto/v1776487462/chat-round_u8wfiq.svg" alt="Chattify Logo" style="height:60px; width:60px;">
       <div style="font-size: larger; font-weight: 700; color: #147658;">Chattify</div>
    </div>

    <!-- Body -->
    <div style="padding:30px; color:#333;">
      
      <h2 style="margin-top:0;">OTP Chattify</h2>
      
      <p>Hi ${name},</p>
      
      <p>Your One-Time Password (OTP) has been successfully resent. Use the code below to continue:</p>
      
      <!-- OTP Box -->
      <div style="text-align:center; margin:25px 0;">
        <span style="display:inline-block; padding:12px 20px; font-size:26px; font-weight:bold; letter-spacing:6px; background:#f3f4f6; border-radius:8px;">
          ${otp}
        </span>
      </div>
      
      <p>This code will expire in <strong>5 minutes</strong>.</p>
      
      <p style="font-size:13px; color:#777;">
        If you didn’t request this, you can safely ignore this email. Never share your OTP with anyone.
      </p>
      
      <p style="margin-top:30px;">Thanks,<br><strong>Chattify Team</strong></p>
    
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#888;">
      © ${new Date().getFullYear()} Chattify. All rights reserved.
    </div>

  </div>

</body>
</html>
  `;
};
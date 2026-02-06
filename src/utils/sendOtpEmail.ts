// OTP email sending utility (requires nodemailer package)
// To use this, install: npm install nodemailer @types/nodemailer

let nodemailer: any;
try {
  nodemailer = require("nodemailer");
} catch {
  // nodemailer not installed - function will log instead
  nodemailer = null;
}

export const sendOtpEmail = async (to: string, otp: string) => {
  if (!nodemailer) {
    // Fallback: log OTP instead of sending email
    console.log(`[OTP EMAIL] Would send OTP ${otp} to ${to}`);
    return;
  }

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error("❌ MAIL ENV NOT LOADED", {
      MAIL_USER: process.env.MAIL_USER,
      MAIL_PASS: process.env.MAIL_PASS ? "OK" : "MISSING",
    });
    // Fallback: log OTP instead of throwing
    console.log(`[OTP EMAIL] Mail credentials missing - OTP ${otp} for ${to}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"MyTripCircle" <${process.env.MAIL_USER}>`,
    to,
    subject: "Your OTP code",
    text: `Your OTP code is: ${otp}`,
  });
};

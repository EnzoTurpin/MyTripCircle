// OTP email sending utility (requires nodemailer package)
// To use this, install: npm install nodemailer @types/nodemailer

let nodemailer: any;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  if (__DEV__) console.warn("[sendOtpEmail] nodemailer non disponible:", e);
  nodemailer = null;
}

export const sendOtpEmail = async (to: string, otp: string) => {
  if (!nodemailer) {
    return;
  }

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
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

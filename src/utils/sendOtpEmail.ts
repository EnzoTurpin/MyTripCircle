import nodemailer from "nodemailer";

export const sendOtpEmail = async (to: string, otp: string) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error("❌ MAIL ENV NOT LOADED", {
      MAIL_USER: process.env.MAIL_USER,
      MAIL_PASS: process.env.MAIL_PASS ? "OK" : "MISSING",
    });
    throw new Error("Mail credentials missing");
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

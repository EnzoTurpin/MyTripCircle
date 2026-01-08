import User from "../models/User.ts";
import { sendOtpEmail } from "../utils/sendOtpEmail.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// interface LoginBody {
//   email: string;
//   password: string;
// }

// POST /auth/register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already used",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashed,
      verified: false,          // ✅ CRITIQUE
      otp,
      otpExpires,             // ✅ NOM UNIQUE
    });

    await sendOtpEmail(user.email, otp);
    // console.log("OTP (DEV):", otp);

    res.status(201).json({
      success: true,
      userId: user._id,
    });
  } catch (e) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown error";

    console.error("REGISTER ERROR FULL:", JSON.stringify(e, null, 2));

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};


// POST /auth/verify-otp

export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.otpExpires ||
      user.otpExpires.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ⛔ Ne jamais renvoyer password / otp
    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (e) {
    console.error("VERIFY OTP ERROR:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// POST /auth/login

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });

    if (!user.verified)
      return res.status(403).json({
        success: false,
        message: "Email not verified",
      });

    if (!user.password)
      return res.status(400).json({
        success: false,
        message: "No password set",
      });

    const same = await bcrypt.compare(password, user.password);
    if (!same)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, user, token });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  avatar: String,

  password: String,

  verified: { type: Boolean, default: false },

  otp: String,
  otpExpires: Date,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);

import express from "express";
import { changePassword, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// edit user profile
router.put("/me", authMiddleware, updateProfile);

// change user password
router.put("/change-password", authMiddleware, changePassword);

export default router;
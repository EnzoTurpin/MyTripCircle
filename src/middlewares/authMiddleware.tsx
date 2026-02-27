import jwt from "jsonwebtoken";
import User from "../models/User";

export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const userId = typeof decoded === "string" ? decoded : (decoded as any).id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false });
  }
};

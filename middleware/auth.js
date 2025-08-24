import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id; // numeric

    const user = await UserModel.findOne({ user_id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default auth;

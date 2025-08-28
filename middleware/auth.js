import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const auth = async (request, res, next) => {
  try {
    const authHeader = request.headers["authorization"];
    // console.log("authHeader:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Handle "Bearer <token>" or raw token
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // console.log("Extracted token:", token);

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded JWT:", decoded);

    // Adjust depending on how you sign JWT in login
    const userId = decoded.user_id || decoded.id || decoded.sub;

    if (!userId) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    // Sequelize findOne → use `where`
    const user = await UserModel.findOne({user_id:userId}).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("req user:--",user)
    request.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
// const auth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid or expired token" });
//   }
// };

export default auth;

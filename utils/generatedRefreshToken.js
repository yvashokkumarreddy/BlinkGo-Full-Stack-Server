import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generatedRefreshToken = async (userId) => {
  try {
    // create refresh token with user_id (auto-incremented)
    const token = jwt.sign(
      { user_id: userId }, // 👈 directly use userId
      process.env.SECRET_KEY_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // update user's refresh_token in DB
    await UserModel.updateOne(
      { user_id: userId },
      { $set: { refresh_token: token } }
    );

    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw error;
  }
};

export default generatedRefreshToken;

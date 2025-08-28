import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generatedAccessToken = async (userId, role) => {
  try {
    // create refresh token with user_id (auto-incremented)
    const token = jwt.sign(
      { user_id: userId, role: role }, // 👈 directly use userId
      process.env.SECRET_KEY_ACCESS_TOKEN,
      { expiresIn: "1d" }
    );


    // update user's refresh_token in DB
    await UserModel.updateOne(
      { user_id: userId },
      { $set: { access_token: token } }
    );

    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
};



export default generatedAccessToken;

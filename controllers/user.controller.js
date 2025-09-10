import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'
import CounterModel from '../models/counterModel.js'
import bcryptjs from 'bcryptjs'



export const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
        error: true,
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
        error: true,
        success: false,
      });
    }

    // Auto increment user_id
    const userCounter = await CounterModel.findOneAndUpdate(
      { id: "user_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const user_id = userCounter.seq;

    // Auto increment cartId
    const cartCounter = await CounterModel.findOneAndUpdate(
      { id: "cart_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const cartId = cartCounter.seq;

    // Auto increment addressId
    const addressCounter = await CounterModel.findOneAndUpdate(
      { id: "addressId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const addressId = addressCounter.seq;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new UserModel({
      user_id,
      name,
      email,
      password: hashedPassword,
      cartId,
      addressId,
    //   role:'user'
    });

    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      error: false,
      data: {
        user_id: newUser.user_id,
        email: newUser.email,
        cartId: newUser.cartId,
        addressId: newUser.addressId,
      },
    });
  } catch (error) {
     console.log("Error =>",error)
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};




export async function verifyEmailController(request,response){
    try {
        const { code } = request.body

        const user = await UserModel.findOne({ user_id : code})

        if(!user){
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({ user_id : code },{
            verify_email : true
        })

        return response.json({
            message : "Verify email done",
            success : true,
            error : false
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : true
        })
    }
}

//login controller

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Provide email and password",
        success: false
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        success: false
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Contact Admin",
        success: false
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Check your password",
        success: false
      });
    }

    // ✅ Generate tokens
    const accessToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.SECRET_KEY_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // ✅ Update last login date
    await UserModel.findOneAndUpdate(
      { user_id: user.user_id },
      { last_login_date: new Date() }
    );

    // ✅ Send token in response (frontend will store in localStorage)
    return res.json({
      message: "Login successful",
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || error,
      success: false
    });
  }
}





export async function logoutController(req, res) {
  try {
    const userId = req.user.user_id;

    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    await UserModel.findOneAndUpdate({ user_id: userId }, { refresh_token: "" });

    return res.json({ message: "Logout successfully", error: false, success: true });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
}


//upload user avatar
export async  function uploadAvatar(request,response){
    try {
        const userId = request.user_id // auth middlware
        const image = request.file  // multer middleware

        const upload = await uploadImageClodinary(image)
        
        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : upload.url
        })

        return response.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                user_id : userId,
                avatar : upload.url
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update user details
export async function updateUserDetails(request,response){
    try {
        const userId = request.user_id //auth middleware
        const { name, email, mobile, password } = request.body 

        let hashPassword = ""

        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password,salt)
        }

        const updateUser = await UserModel.updateOne({ user_id : userId},{
            ...(name && { name : name }),
            ...(email && { email : email }),
            ...(mobile && { mobile : mobile }),
            ...(password && { password : hashPassword })
        })

        return response.json({
            message : "Updated successfully",
            error : false,
            success : true,
            data : updateUser
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const otp = generatedOtp();
    const expireTime = Date.now() + 60 * 60 * 1000; // 1hr

    await UserModel.findOneAndUpdate(
      { email },
      {
        forgot_password_otp: otp,
        forgot_password_expiry: new Date(expireTime).toISOString(),
      }
    );

    await sendEmail({
      sendTo: email,
      subject: "Forgot password from BlinGoo",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
      }),
    });

    return res.json({
      message: "Check your email",
      error: false,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide required fields email, otp.",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (user.forgot_password_expiry < currentTime) {
      return res.status(400).json({
        message: "Otp is expired",
        error: true,
        success: false,
      });
    }

    if (String(otp).trim() !== String(user.forgot_password_otp).trim()) {
      return res.status(400).json({
        message: "Invalid otp",
        error: true,
        success: false,
      });
    }

    await UserModel.findOneAndUpdate(
      { email },
      { forgot_password_otp: "", forgot_password_expiry: "" }
    );

    return res.json({
      message: "Verify otp successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
export async function resetpassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Provide required fields email, newPassword, confirmPassword",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "newPassword and confirmPassword must be same.",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(newPassword, salt);

    await UserModel.findOneAndUpdate(
      { email },
      { password: hashPassword }
    );

    return res.json({
      message: "Password updated successfully.",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
      return res.status(401).json({
        message: "No refresh token provided",
        error: true,
        success: false,
      });
    }

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
    } catch (err) {
      return res.status(401).json({
        message: "Token is expired or invalid",
        error: true,
        success: false,
      });
    }
    console.log("decoded",decoded)
    // handle id from payload
    const userId = decoded.user_id;
    if (!userId) {
      return res.status(400).json({
        message: "Invalid token payload",
        error: true,
        success: false,
      });
    }

    // fetch user
    const user = await UserModel.findOne({user_id:userId}); // 👈 switch to findOne if you’re using user_id field
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }
    console.log(user,"34567898")
    // generate new access token
    const newAccessToken = await generatedAccessToken(user.user_id);

    // set cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
}

export async function userDetails(request, response) {
  try {
    const userId = request.user?.user_id; // get from auth middleware
    if (!userId) {
      return response.status(401).json({
        message: "Unauthorized",
        success: false
      });
    }

    const user = await UserModel.findOne({ user_id: userId }) // ✅ filter correctly
      .select("-password -refresh_token");

    if (!user) {
      return response.status(404).json({ message: "User not found", success: false });
    }

    return response.json({
      message: "user details",
      data: user,
      success: true
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false
    });
  }
}

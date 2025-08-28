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

        const user = await UserModel.findOne({ _id : code})

        if(!user){
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({ _id : code },{
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

export async function loginController(request, response) {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                message: "Provide email and password",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });
        console.log("user:-", user);
        if (!user) {
            return response.status(400).json({
                message: "User not registered",
                error: true,
                success: false
            });
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact Admin",
                error: true,
                success: false
            });
        }

        const checkPassword = await bcrypt
        .compare(password, user.password);
        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            });
        }

        // const accessToken = await generatedAccessToken(user.user_id,user.role);
        const refreshToken = await genertedRefreshToken(user.user_id);
        const accessToken = jwt.sign({user_id: user.user_id},
            process.env.JWT_SECRET,{
                expiresIn : "1d"
            }
        )
        // ✅ Use findOneAndUpdate with user_id
        await UserModel.findOneAndUpdate(
            { user_id: user.user_id },
            { last_login_date: new Date() }
        );

        // Set cookies (optional if frontend is not using cookies)
        const isProduction = process.env.NODE_ENV === "production";
        const cookiesOption = {
            httpOnly: true,
            secure: isProduction,      
            sameSite: isProduction ? "None" : "Lax",
        };

        response.cookie("accessToken", accessToken, cookiesOption);
        response.cookie("refreshToken", refreshToken, cookiesOption);

        // 🔥 Set Authorization header in response
        response.setHeader("Authorization", `Bearer ${accessToken}`);

        return response.json({
            message: "Login successfully",
            error: false,
            success: true,
            token: accessToken,
            refreshToken,
            user: {
                user_id: user.user_id,
                email:user.email,
                role:user.role
            }
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}



//logout controller
export async function logoutController(request,response){
    try {
        const userid = request.user_id //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
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

//forgot password not login
export async function forgotPasswordController(request,response) {
    try {
        const { email } = request.body 

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        const update = await UserModel.findByIdAndUpdate(user.user_id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from Binkeyit",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return response.json({
            message : "check your email",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }
        if (String(otp).trim() !== String(user.forgot_password_otp).trim()) {
                    console.log(otp,"orig",user.forgot_password_otp,"user_otp")

        return response.status(400).json({
            message: "Invalid otp",
            error: true,
            success: false,
        });
        }


        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?.user_id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//reset the password
export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user.user_id,{
            password : hashPassword
        })

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
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





//get login user details
export async function userDetails(request,response){
    try {
        const userId  = request.user_id
        console.log("request_body",request.user_id)
        
const user = await UserModel.findOne(userId)
  .select("-password -refresh_token");

if (!user) {
  return response.status(404).json({ message: "User not found" });
}
// response.json(user);
        console.log("no",user)
        return response.json({
            message : 'user details',
            data : user,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}
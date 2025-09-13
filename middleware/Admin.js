import { Admin } from "mongodb"
import UserModel from "../models/user.model.js"

export const admin = async(request,response,next)=>{
    try {
       const  userId = request.user.user_id
       
       const user = await UserModel.findOne({user_id:userId})

       if(user.role !== 'ADMIN'){
            return response.status(400).json({
                message : "Permission denial",
                error : true,
                success : false
            })
       }

       next()

    } catch (error) {
        next(error)
        return response.status(500).json({
            message : "Permission denial",
            error : true,
            success : false
        })
    }
}
export default Admin 
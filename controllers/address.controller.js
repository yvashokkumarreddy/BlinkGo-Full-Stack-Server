import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js"; 

export const addAddressController = async(request,response)=>{
    try {
        const userId = request.user.user_id
        // console.log("user is fro auth request",request.user) // middleware
        const { address_line , city, state, pincode, country,mobile } = request.body
        // console.log("getting form addrss body",request.body)
        const createAddress = new AddressModel({
            address_line,
            addressId:request.user.addressId,
            user_id:request.user.user_id,
            city,
            state,
            country,
            pincode,
            mobile,
        })
        const saveAddress = await createAddress.save()

        const addUserAddressId = await UserModel.findByIdAndUpdate({_id:request.user._id},{
            $push : {
                address_details : saveAddress._id
            }
        })

        return response.json({
            message : "Address Created Successfully",
            error : false,
            success : true,
            data : saveAddress
        })

    } catch (error) {
        console.log("error+>",error)
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getAddressController = async(request,response)=>{
    try {
        const userId = request.user.user_id // middleware auth

        const data = await AddressModel.find({ user_id : userId }).sort({ createdAt : -1})

        return response.json({
            data : data,
            message : "List of address",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const updateAddressController = async(request,response)=>{
    try {
        const userId = request.user.user_id // middleware auth 
        const { address_id, address_line,city,state,country,pincode, mobile } = request.body 
        console.log("req_body",request.params)
        const updateAddress = await AddressModel.updateOne({ address_id : address_id, user_id : userId },{
            address_line,
            city,
            state,
            country,
            mobile,
            pincode
        },
    {new: true})

        return response.json({
            message : "Address Updated",
            error : false,
            success : true,
            data : updateAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteAddresscontroller = async(request,response)=>{
    try {
        const userId = request.user.user_id // auth middleware    
        const { address_id } = request.body 

        const disableAddress = await AddressModel.deleteOne({ address_id : address_id, user_id:userId},{
            status : false
        })

        return response.json({
            message : "Address remove",
            error : false,
            success : true,
            data : disableAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

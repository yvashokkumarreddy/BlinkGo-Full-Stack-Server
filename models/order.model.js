import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user_id : {
        type : Number,
        ref : 'Customers'
    },
    order_no: {
        type: Number,
        required: true,
        unique: true
    },
    orderId : {
        type : String,
        required : [true, "Provide orderId"]
    },
    productId : {
        type : Number,
        ref : "product",
        require: true
    },
    product_details : {
        name : String,
        image : Array,
    },
    paymentId : {
        type : String,
        default : ""
    },
    payment_status : {
        type : String,
        default : "Pending"
    },
    delivery_address : {
        type : Number,
        ref : 'address'
    },
    subTotalAmt : {
        type : Number,
        default : 0
    },
    totalAmt : {
        type : Number,
        default : 0
    },
    invoice_receipt : {
        type : String,
        default : ""
    }
},{
    timestamps : true
})
orderSchema.index({ user_id: 1, "order_no": 1 }, { unique: true });
const OrderModel = mongoose.model('order',orderSchema)

export default OrderModel
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      ref: "product",
    },
    product_details: {
      name: String,
      image: Array,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    discount: {
      type: Number,
      default: 1, // fixed typo
    },
    price: {
      type: Number,
      default: 0,
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    delivery_date: {
      type: Date,
      default: null,
    },
    order_date: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      ref: "Customers",
      required: true,
    },
    order_no: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      required: [true, "Provide orderId"],
    },
    razorpayOrderId: {
      type: String
    },
    items: [itemSchema], // multiple products in one order
    paymentId: {
      type: String,
      default: "",
    },
    paymentMode: {
    type: String,
    enum: ['COD', 'ONLINE'],
    default: 'COD'
  },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    status: {
      type: String,
      default: "Pending", // <-- New field added
      enum: ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    },
    delivery_address: {
      type: Number,
      ref: "address",
      required: true,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure order_no is unique per user
orderSchema.index({ user_id: 1, order_no: 1 }, { unique: true });

const OrderModel =mongoose.models.userOrders || mongoose.model("userOrders", orderSchema);

export default OrderModel;

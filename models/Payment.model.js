import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: Number, ref: "Customers" },
    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "Pending", "Paid", "Failed", "Refunded"],
      default: "created",
    },
    address: { type: String },
  },
  { timestamps: true }
);
const PaymentsModel = mongoose.model("Payment", PaymentSchema);

export default PaymentsModel;
import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const shippingLabelSchema = new mongoose.Schema({
  shippingId: { type: Number, unique: true },
  orderId: { type: String, unique: true, required: true },
  carrierService: { type: String, required: true },
  serviceType: { type: String, required: true },
  packageName: { type: String, default: "" },
  packageType: { type: String, default: "" },
  weight: { type: Number, default: 0 },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  product: { type: Array, default: [] },
  shippingDate: { type: Date, default: Date.now },
  deiverydate: {type:Date,default :Date.now},
  trackingNumber: { type: String, unique: true, required: true },
  returnAddress: {
    fullAddress: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
}, { timestamps: true });

// Auto increment shippingId starting from 1000
shippingLabelSchema.plugin(AutoIncrement, { inc_field: "shippingId", start_seq: 1000 });

export default mongoose.model("ShippingLabel", shippingLabelSchema);

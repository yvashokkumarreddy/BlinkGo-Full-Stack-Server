import mongoose from "mongoose";
import CounterModel from "./CounterModel.js";

const addressSchema = new mongoose.Schema(
  {
    address_line: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String, // Number can cause issues with leading 0, use String
      default: null
    },
    addressId:{
      type: Number,
      unique: true,
      ref: "Customers"
    },
    address_id:{
      type: Number,
      unique: true
    },
    status: {
      type: Boolean,
      default: true
    },
    user_id: {
      type: Number,
      required: true,
      ref:"Customers"
    }
  },
  {
    timestamps: true
  }
);
addressSchema.pre("save", async function (next) {
  if (this.isNew && !this.address_id) {
    try {
      // Generate cartItemId
      const counterItem = await CounterModel.findOneAndUpdate(
        { id: "address_id" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.address_id = counterItem.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;

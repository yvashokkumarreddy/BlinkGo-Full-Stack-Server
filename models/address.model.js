import mongoose from "mongoose";

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
      unique: true
    },
    status: {
      type: Boolean,
      default: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // better to reference User collection
      required: true
    }
  },
  {
    timestamps: true
  }
);
addressSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await CounterModel.findByIdAndUpdate(
        { _id: "addressId" }, // counter key for categories
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.addressId = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const AddressModel = mongoose.model("address", addressSchema);

export default AddressModel;

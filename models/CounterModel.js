import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g. "user_id"
  seq: { type: Number, default: 0 },
  user_id: { type: Number, default: null }
});

const CounterModel = mongoose.models.counter||mongoose.model("counter", counterSchema);
export default CounterModel;

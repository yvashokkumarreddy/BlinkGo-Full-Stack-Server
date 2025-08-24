import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema({
  org_id: {
    type: Number, // keep it numeric (like 4)
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  }
}, { timestamps: true });

const OrganisationModel = mongoose.model("Organisation", organisationSchema);

export default OrganisationModel;

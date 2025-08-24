import mongoose from "mongoose";
import dotenv from "dotenv";
import OrganisationModel from "./models/organisation.model.js";

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // check if org_id=4 already exists
    const existingOrg = await OrganisationModel.findOne({ org_id: 4 });
    if (existingOrg) {
      console.log("Organisation already exists:", existingOrg.name);
    } else {
      const org = await OrganisationModel.create({
        org_id: 4,
        name: "BinkGO Pvt Ltd",
        description: "Default organisation for users"
      });
      console.log("Organisation created:", org);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error creating organisation:", err);
    process.exit(1);
  }
})();

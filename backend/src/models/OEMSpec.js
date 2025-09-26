import mongoose from "mongoose";

const OEMSpecSchema = new mongoose.Schema({
  manufacturer: { type: String, required: true },
  modelName: { type: String, required: true },
  year: { type: Number, required: true },
  listPrice: Number,
  colors: [String],
  mileage: String,
  powerBHP: Number,
  maxSpeed: Number
}, { timestamps: true });

export default mongoose.model("OEMSpec", OEMSpecSchema);
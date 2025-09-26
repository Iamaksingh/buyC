import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  images: [String],
  bulletPoints: [String],
  price: Number,
  color: String,
  kmsOnOdometer: Number,
  majorScratches: Boolean,
  originalPaint: Boolean,
  accidentsReported: Number,
  previousOwners: Number,
  registrationPlace: String,
  oemSpec: { type: mongoose.Schema.Types.ObjectId, ref: "OEMSpec" }
}, { timestamps: true });

export default mongoose.model("Inventory", InventorySchema);
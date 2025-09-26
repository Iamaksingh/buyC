import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "dealer" }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
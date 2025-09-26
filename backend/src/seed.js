import dotenv from "dotenv";
import mongoose from "mongoose";
import OEMSpec from "./models/OEMSpec.js";
import connectDB from "./db.js";

dotenv.config();
await connectDB();

const data = [
  {
    manufacturer: "Honda",
    modelName: "City",
    year: 2015,
    listPrice: 800000,
    colors: ["White","Silver","Black"],
    mileage: "18 kmpl",
    powerBHP: 118,
    maxSpeed: 180
  },
  {
    manufacturer: "Maruti",
    modelName: "Swift",
    year: 2017,
    listPrice: 600000,
    colors: ["Red","White"],
    mileage: "22 kmpl",
    powerBHP: 85,
    maxSpeed: 170
  }
];

await OEMSpec.deleteMany({});
await OEMSpec.insertMany(data);
console.log("✅ OEM specs seeded");
process.exit(0);

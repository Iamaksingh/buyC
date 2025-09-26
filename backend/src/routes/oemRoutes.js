import express from "express";
import OEMSpec from "../models/OEMSpec.js";

const router = express.Router();

// Count all OEM models
router.get("/count", async (req, res) => {
  const count = await OEMSpec.countDocuments();
  res.json({ count });
});

// List OEM specs with optional filters and basic pagination
router.get("/list", async (req, res) => {
  const { q, manufacturer, modelName, year, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { manufacturer: regex },
      { modelName: regex },
      { year: Number(q) || -1 }
    ];
  }
  if (manufacturer) filter.manufacturer = new RegExp(manufacturer, "i");
  if (modelName) filter.modelName = new RegExp(modelName, "i");
  if (year) filter.year = parseInt(year);

  const docs = await OEMSpec.find(filter)
    .sort({ manufacturer: 1, modelName: 1, year: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await OEMSpec.countDocuments(filter);
  res.json({
    items: docs,
    page: Number(page),
    limit: Number(limit),
    total
  });
});

// Search by query e.g. q=Honda City 2015
router.get("/search", async (req, res) => {
  const { q, manufacturer, modelName, year } = req.query;

  let filter = {};
  if (q) {
    const parts = q.split(" ");
    const yr = parts.find(p => /^\d{4}$/.test(p));
    const rest = parts.filter(p => p !== yr);
    filter = {
      manufacturer: new RegExp(rest[0] || "", "i"),
      modelName: new RegExp(rest[1] || "", "i"),
      year: yr ? parseInt(yr) : undefined
    };
  } else {
    if (manufacturer) filter.manufacturer = new RegExp(manufacturer, "i");
    if (modelName) filter.modelName = new RegExp(modelName, "i");
    if (year) filter.year = parseInt(year);
  }

  const result = await OEMSpec.findOne(filter);
  res.json(result || {});
});

export default router;

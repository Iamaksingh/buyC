import express from "express";
import multer from "multer";
import Inventory from "../models/Inventory.js";
import OEMSpec from "../models/OEMSpec.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Add car
router.post("/", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const images = req.files && req.files.length > 0 
      ? req.files.map(f => `/uploads/${f.filename}`) 
      : [];

    const inv = await Inventory.create({
      dealerId: req.userId,
      title: req.body.title,
      price: req.body.price,
      color: req.body.color,
      kmsOnOdometer: req.body.kmsOnOdometer,
      bulletPoints: Array.isArray(req.body.bulletPoints)
        ? req.body.bulletPoints
        : req.body.bulletPoints
          ? [req.body.bulletPoints]
          : [],
      images,
      oemSpec: req.body.oemSpec || undefined
    });

    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Get inventory with filters
router.get("/", async (req, res) => {
  const { minPrice, maxPrice, color, minMileage, maxMileage } = req.query;
  const q = {};
  if (minPrice) q.price = { ...(q.price || {}), $gte: Number(minPrice) };
  if (maxPrice) q.price = { ...(q.price || {}), $lte: Number(maxPrice) };
  if (color) q.color = color;

  // Base query
  let cursor = Inventory.find(q).populate("oemSpec").limit(100);

  // If mileage filter present, filter after population using OEM mileage (string like "18 kmpl")
  if (minMileage || maxMileage) {
    const items = await cursor;
    const toNumber = (m) => {
      if (typeof m !== "string") return undefined;
      const match = m.match(/\d+(?:\.\d+)?/);
      return match ? Number(match[0]) : undefined;
    };
    const filtered = items.filter((item) => {
      const mil = toNumber(item?.oemSpec?.mileage);
      if (mil === undefined) return false;
      if (minMileage && mil < Number(minMileage)) return false;
      if (maxMileage && mil > Number(maxMileage)) return false;
      return true;
    });
    return res.json(filtered);
  }

  const items = await cursor;
  res.json(items);
});

// Edit
router.put("/:id", authMiddleware, async (req, res) => {
  const update = { ...req.body };
  if (update.oemSpec === "" || update.oemSpec === null) {
    update.oemSpec = undefined;
  }
  const inv = await Inventory.findOneAndUpdate(
    { _id: req.params.id, dealerId: req.userId },
    update,
    { new: true }
  ).populate("oemSpec");
  res.json(inv);
});

// Delete single
router.delete("/:id", authMiddleware, async (req, res) => {
  await Inventory.deleteOne({ _id: req.params.id, dealerId: req.userId });
  res.json({ success: true });
});

// Bulk delete
router.post("/bulk-delete", authMiddleware, async (req, res) => {
  const { ids } = req.body;
  await Inventory.deleteMany({ _id: { $in: ids }, dealerId: req.userId });
  res.json({ success: true });
});

export default router;

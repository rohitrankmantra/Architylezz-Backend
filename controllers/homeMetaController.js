import HomeMeta from "../models/HomeMeta.js";

// 🔵 Get Home Meta (single)
export const getHomeMeta = async (req, res) => {
  try {
    const meta = await HomeMeta.findOne(); // fetch the first (and only) record
    res.json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Create or Initialize Home Meta (only if none exists)
export const createHomeMeta = async (req, res) => {
  try {
    const existing = await HomeMeta.findOne();
    if (existing) return res.status(400).json({ message: "Home Meta already exists" });

    const { title, description } = req.body;
    const meta = await HomeMeta.create({ title, description });
    res.status(201).json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟡 Update Home Meta
export const updateHomeMeta = async (req, res) => {
  try {
    const { title, description } = req.body;

    const meta = await HomeMeta.findOneAndUpdate(
      {}, // match the only record
      { title, description },
      { new: true, upsert: true } // create if not exists
    );

    res.json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 Delete Home Meta
export const deleteHomeMeta = async (req, res) => {
  try {
    const meta = await HomeMeta.findOneAndDelete();
    if (!meta) return res.status(404).json({ message: "Meta not found" });
    res.json({ message: "Meta deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

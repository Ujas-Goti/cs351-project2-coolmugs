const express = require("express");
const router = express.Router();

// Steven replaces these with the real session cart.
router.get("/", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

router.post("/", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

router.put("/:itemId", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

router.delete("/:itemId", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

module.exports = router;
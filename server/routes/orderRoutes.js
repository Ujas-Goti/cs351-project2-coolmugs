const express = require("express");
const router = express.Router();

// Steven replaces these with checkout and order history.
router.post("/", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

router.get("/", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

router.get("/:id", (req, res) => {
  res.status(501).json({ error: "Not built yet." });
});

module.exports = router;
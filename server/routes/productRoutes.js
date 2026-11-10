const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Return every mug in the products collection.
router.get("/", async (req, res, next) => {
  try {
    const products = await req.app.locals.db.collection("products").find({}).toArray();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Match the numeric product id. If that misses, try the Mongo _id.
router.get("/:id", async (req, res, next) => {
  try {
    const collection = req.app.locals.db.collection("products");
    const numericId = Number(req.params.id);
    let product = null;

    if (!Number.isNaN(numericId)) {
      product = await collection.findOne({ id: numericId });
    }

    if (!product && ObjectId.isValid(req.params.id)) {
      product = await collection.findOne({ _id: new ObjectId(req.params.id) });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
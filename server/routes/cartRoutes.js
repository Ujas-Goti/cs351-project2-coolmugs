
const express = require("express");
const router = express.Router();

// Get the current cart from the session.
function getCart(req) {
  return req.session.cart || [];
}

// Return the current cart.
function getCartItems(req, res) {
  res.json(getCart(req));
}

// Add a product to the cart.
async function addCartItem(req, res, next) {
  try {
    const { productId, color, capacity, quantity } = req.body;

    if (
      !productId ||
      !color ||
      !capacity ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        error: "Please provide a valid product, color, capacity, and quantity."
      });
    }

    const db = req.app.locals.db;

    // Always get the product price from MongoDB.
    const product = await db.collection("products").findOne({
      id: Number(productId)
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found."
      });
    }

    const cartItems = getCart(req);

    const cartId = `${productId}-${color}-${capacity}`;

    const existingItem = cartItems.find(
      (item) => item.cartId === cartId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        cartId,
        productId: product.id,
        name: product.name,
        image: product.image,
        color,
        capacity,
        quantity,
        price: product.price
      });
    }

    req.session.cart = cartItems;

    res.json(cartItems);
  } catch (error) {
    next(error);
  }
}

// Change the quantity of an existing cart item.
function updateCartItem(req, res) {
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      error: "Quantity must be a positive integer."
    });
  }

  const cartItems = getCart(req);

  const item = cartItems.find(
    (item) => item.cartId === req.params.itemId
  );

  if (!item) {
    return res.status(404).json({
      error: "Cart item not found."
    });
  }

  item.quantity = quantity;

  req.session.cart = cartItems;

  res.json(cartItems);
}

// Remove an item from the cart.
function deleteCartItem(req, res) {
  const cartItems = getCart(req);

  const updatedCart = cartItems.filter(
    (item) => item.cartId !== req.params.itemId
  );

  if (updatedCart.length === cartItems.length) {
    return res.status(404).json({
      error: "Cart item not found."
    });
  }

  req.session.cart = updatedCart;

  res.json(updatedCart);
}

router.get("/", getCartItems);
router.post("/", addCartItem);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", deleteCartItem);

module.exports = router;


const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();
const TAX_RATE = 0.09;

// Check whether the customer is logged in.
function requireLogin(req, res, next) {
  if (!req.session.userId || !ObjectId.isValid(req.session.userId)) {
    return res.status(401).json({ error: "Log in first." });
  }

  next();
}

// Check that an address has all required fields.
function validAddress(address) {
  return (
    address &&
    typeof address.street === "string" &&
    address.street.trim() &&
    typeof address.city === "string" &&
    address.city.trim() &&
    typeof address.state === "string" &&
    address.state.trim() &&
    typeof address.zip === "string" &&
    /^\d{5}$/.test(address.zip.trim())
  );
}

// Check that checkout information is complete.
function validCheckout(body) {
  const customer = body.customer;
  const payment = body.payment;

  return (
    customer &&
    typeof customer.name === "string" &&
    customer.name.trim() &&
    typeof customer.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim()) &&
    typeof customer.phone === "string" &&
    customer.phone.trim() &&
    validAddress(body.shippingAddress) &&
    validAddress(body.billingAddress) &&
    payment &&
    typeof payment.cardType === "string" &&
    payment.cardType.trim() &&
    typeof payment.last4 === "string" &&
    /^\d{4}$/.test(payment.last4)
  );
}

// Submit an order using prices stored in MongoDB.
async function createOrder(req, res, next) {
  try {
    if (!validCheckout(req.body)) {
      return res.status(400).json({
        error: "Please provide valid customer, address, and payment information."
      });
    }

    const cartItems = req.session.cart || [];

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    const db = req.app.locals.db;
    const products = db.collection("products");
    const orderItems = [];

    let subtotal = 0;

    // Look up each product and calculate its price from the database.
    for (const item of cartItems) {
      const product = await products.findOne({
        id: Number(item.productId)
      });

      if (!product) {
        return res.status(404).json({
          error: "A product in your cart could not be found."
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > product.quantityInStock
      ) {
        return res.status(400).json({
          error: `Invalid quantity for ${product.name}.`
        });
      }

      const unitPrice = product.price;
      const lineTotal = unitPrice * item.quantity;

      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.image,
        color: item.color,
        capacity: item.capacity,
        quantity: item.quantity,
        unitPrice,
        lineTotal
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const shippingCost = 0;
    const total = Number((subtotal + tax + shippingCost).toFixed(2));

    const order = {
      userId: new ObjectId(req.session.userId),
      orderDate: new Date(),
      customer: {
        name: req.body.customer.name.trim(),
        email: req.body.customer.email.trim(),
        phone: req.body.customer.phone.trim()
      },
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress,
      payment: {
        cardType: req.body.payment.cardType.trim(),
        last4: req.body.payment.last4
      },
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      status: "Submitted"
    };

    const result = await db.collection("orders").insertOne(order);

    req.session.cart = [];

    res.status(201).json({
      ...order,
      _id: result.insertedId
    });
  } catch (error) {
    next(error);
  }
}

// Return all orders belonging to the logged-in customer.
async function getOrders(req, res, next) {
  try {
    const orders = await req.app.locals.db
      .collection("orders")
      .find({ userId: new ObjectId(req.session.userId) })
      .sort({ orderDate: -1 })
      .toArray();

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

// Return one order if it belongs to the logged-in customer.
async function getOrder(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Order not found." });
    }

    const order = await req.app.locals.db.collection("orders").findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.session.userId)
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

router.post("/", requireLogin, createOrder);
router.get("/", requireLogin, getOrders);
router.get("/:id", requireLogin, getOrder);

module.exports = router;

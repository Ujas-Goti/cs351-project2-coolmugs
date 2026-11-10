const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

// bcryptjs is the bcrypt-compatible hash. Passwords are never stored as plain text.
const router = express.Router();

function publicUser(user) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    phone: user.phone || "",
    shippingAddress: user.shippingAddress || {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
  };
}

function validateAccount(body, passwordRequired) {
  const errors = [];
  const username = (body.username || "").trim();
  const email = (body.email || "").trim();
  const password = body.password || "";
  const street = (body.street || "").trim();
  const city = (body.city || "").trim();
  const state = (body.state || "").trim();
  const zip = (body.zip || "").trim();
  const phoneDigits = (body.phone || "").replace(/\D/g, "");

  if (!username) errors.push("Username is required.");
  if (passwordRequired && password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }
  if (!passwordRequired && password && password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Enter a valid email address.");
  }

  if (street || city || state || zip) {
    if (!street) errors.push("Street is required.");
    if (!city) errors.push("City is required.");
    if (!state) errors.push("State is required.");
    if (!/^\d{5}$/.test(zip)) errors.push("ZIP code must contain 5 digits.");
  }

  if (body.phone && phoneDigits.length !== 10) {
    errors.push("Phone number must contain 10 digits.");
  }

  return { errors, username, email, password, street, city, state, zip, phone: phoneDigits };
}

async function findTaken(users, username, email, currentId) {
  const existing = await users.findOne({
    $or: [{ username }, { email }],
  });
  if (!existing) return null;
  if (currentId && String(existing._id) === String(currentId)) return null;
  if (existing.username === username) return "That username is already taken.";
  return "That email is already taken.";
}

router.post("/accounts", async (req, res, next) => {
  try {
    const fields = validateAccount(req.body, true);
    if (fields.errors.length) {
      return res.status(400).json({ error: fields.errors[0] });
    }

    const users = req.app.locals.db.collection("users");
    const taken = await findTaken(users, fields.username, fields.email);
    if (taken) return res.status(409).json({ error: taken });

    await users.insertOne({
      username: fields.username,
      email: fields.email,
      passwordHash: await bcrypt.hash(fields.password, 10),
      phone: fields.phone,
      shippingAddress: {
        street: fields.street,
        city: fields.city,
        state: fields.state,
        zip: fields.zip,
      },
    });

    res.status(201).json({ message: "Account created. Please log in." });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const login = (req.body.login || "").trim();
    const password = req.body.password || "";
    const users = req.app.locals.db.collection("users");
    const user = await users.findOne({ $or: [{ username: login }, { email: login }] });
    const matches = user && await bcrypt.compare(password, user.passwordHash);

    if (!matches) {
      return res.status(401).json({ error: "Wrong username or password." });
    }

    req.session.userId = String(user._id);
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

router.get("/account", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Log in first." });
    }
    const user = await req.app.locals.db.collection("users").findOne({
      _id: new ObjectId(req.session.userId),
    });
    if (!user) return res.status(401).json({ error: "Log in first." });
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

router.put("/account", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Log in first." });
    }

    const fields = validateAccount(req.body, false);
    if (fields.errors.length) {
      return res.status(400).json({ error: fields.errors[0] });
    }

    const users = req.app.locals.db.collection("users");
    const taken = await findTaken(users, fields.username, fields.email, req.session.userId);
    if (taken) return res.status(409).json({ error: taken });

    const update = {
      username: fields.username,
      email: fields.email,
      phone: fields.phone,
      shippingAddress: {
        street: fields.street,
        city: fields.city,
        state: fields.state,
        zip: fields.zip,
      },
    };
    if (fields.password) {
      update.passwordHash = await bcrypt.hash(fields.password, 10);
    }

    await users.updateOne(
      { _id: new ObjectId(req.session.userId) },
      { $set: update }
    );
    const user = await users.findOne({ _id: new ObjectId(req.session.userId) });
    res.json(publicUser(user));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
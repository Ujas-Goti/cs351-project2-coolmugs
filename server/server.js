const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoClient } = require("mongodb");
const productRoutes = require("./routes/productRoutes");
const accountRoutes = require("./routes/accountRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
let client;

app.set("trust proxy", 1);
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
}));

app.use("/api/products", productRoutes);
app.use("/api", accountRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

// API routes are already handled. Any other GET returns the React app.
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(clientDist, "index.html"), (error) => {
    if (error) {
      next();
    }
  });
});

app.use(errorHandler);

// Open Mongo once and reuse that connection until the process stops.
async function startServer() {
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  app.locals.db = client.db(process.env.MONGODB_DB);

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Listening on ${port}`);
  });

  process.on("SIGTERM", async () => {
    server.close();
    await client.close();
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
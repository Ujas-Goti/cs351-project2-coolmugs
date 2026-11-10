const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { MongoClient } = require("mongodb");

// Load the 25 Cool Mugs from the Project 1 product file.
const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf8")
);

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);

  const productsCollection = db.collection("products");
  await productsCollection.deleteMany({});
  const result = await productsCollection.insertMany(products);

  await db.collection("users").createIndex({ username: 1 }, { unique: true });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });

  console.log(`Inserted ${result.insertedCount} products`);
  await client.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
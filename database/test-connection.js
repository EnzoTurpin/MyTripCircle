// Test de connexion MongoDB
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "mytripcircle";

async function testConnection() {
  console.log(`[test] Testing connection to: ${MONGODB_URI}`);
  console.log(`[test] Database: ${DB_NAME}`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("[test] ✅ Connected to MongoDB successfully");

    const db = client.db(DB_NAME);

    // Test des collections
    const collections = await db.listCollections().toArray();
    console.log(
      `[test] Collections found: ${collections.map((c) => c.name).join(", ")}`
    );

    // Test des données
    const [users, trips, bookings, addresses] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("trips").countDocuments(),
      db.collection("bookings").countDocuments(),
      db.collection("addresses").countDocuments(),
    ]);

    console.log(`[test] Data counts:`);
    console.log(`  - Users: ${users}`);
    console.log(`  - Trips: ${trips}`);
    console.log(`  - Bookings: ${bookings}`);
    console.log(`  - Addresses: ${addresses}`);

    // Test d'un trip spécifique
    const trip = await db.collection("trips").findOne({ _id: "1" });
    if (trip) {
      console.log(`[test] ✅ Found trip: ${trip.title} (${trip.destination})`);
    } else {
      console.log(`[test] ❌ Trip with ID "1" not found`);
    }
  } catch (error) {
    console.error("[test] ❌ Connection failed:", error.message);
  } finally {
    await client.close();
    console.log("[test] Connection closed");
  }
}

testConnection();

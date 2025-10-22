// database/seed.js
const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Panda_Sauvage:z8vLyaPgk72fIT0h@cluster0.2qorlea.mongodb.net/";

const DB_NAME = process.env.DB_NAME || "mytripcircle";

async function run() {
  console.log(`[seed] URI=${MONGODB_URI} DB=${DB_NAME}`);
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const users = db.collection("users");
  const trips = db.collection("trips");
  const bookings = db.collection("bookings");
  const addresses = db.collection("addresses");

  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    trips.createIndex({ ownerId: 1 }),
    trips.createIndex({ "collaborators.userId": 1 }),
    bookings.createIndex({ tripId: 1, date: 1 }),
    addresses.createIndex({ tripId: 1 }),
  ]);

  await Promise.all([
    users.deleteMany({}),
    trips.deleteMany({}),
    bookings.deleteMany({}),
    addresses.deleteMany({}),
  ]);

  const now = new Date();

  // Users with ObjectId _id
  const u1 = new ObjectId();
  const u2 = new ObjectId();
  const u3 = new ObjectId();
  await users.insertMany([
    {
      _id: u1,
      email: "owner@example.com",
      name: "Owner User",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: u2,
      email: "collab1@example.com",
      name: "Collaborator 1",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: u3,
      email: "collab2@example.com",
      name: "Collaborator 2",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Trips with ownerId as ObjectId (matches validator)
  const t1 = "1";
  const t2 = "2";
  await trips.insertMany([
    {
      _id: t1, // string _id OK
      title: "Paris Adventure",
      description: "A romantic getaway to the City of Light with friends",
      startDate: new Date("2024-03-15"),
      endDate: new Date("2024-03-22"),
      destination: "Paris, France",
      ownerId: u1, // ObjectId as required
      collaborators: [{ userId: u2.toString() }, { userId: u3.toString() }],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: t2,
      title: "Tokyo Discovery",
      description: "Exploring Tokyo landmarks and cuisine",
      startDate: new Date("2024-06-10"),
      endDate: new Date("2024-06-20"),
      destination: "Tokyo, Japan",
      ownerId: u1,
      collaborators: [{ userId: u2.toString() }],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Bookings (tripId strings consistent with trips _id)
  await bookings.insertMany([
    {
      _id: "1",
      tripId: t1,
      type: "flight",
      title: "Paris Flight",
      description: "Round trip to Paris",
      date: new Date("2024-03-15"),
      time: "14:30",
      confirmationNumber: "ABC123",
      price: 450,
      currency: "EUR",
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "2",
      tripId: t1,
      type: "hotel",
      title: "Hotel Le Marais",
      description: "3 nights in Paris",
      date: new Date("2024-03-15"),
      address: "123 Rue de Rivoli, Paris",
      confirmationNumber: "HOT456",
      price: 300,
      currency: "EUR",
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "3",
      tripId: t1,
      type: "restaurant",
      title: "Le Comptoir du Relais",
      description: "Dinner reservation",
      date: new Date("2024-03-16"),
      time: "20:00",
      address: "9 Carrefour de l'Odéon, Paris",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "4",
      tripId: t2,
      type: "activity",
      title: "Tokyo Skytree Visit",
      description: "Observation deck tickets",
      date: new Date("2024-06-12"),
      time: "10:00",
      price: 25,
      currency: "USD",
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // Addresses
  await addresses.insertMany([
    {
      _id: "1",
      tripId: t1,
      type: "hotel",
      name: "Hotel Le Marais",
      address: "123 Rue de Rivoli",
      city: "Paris",
      country: "France",
      coordinates: { latitude: 48.8566, longitude: 2.3522 },
      phone: "+33 1 42 36 78 90",
      website: "https://hotelmarais.com",
      notes: "Check-in at 3 PM, check-out at 11 AM",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "2",
      tripId: t1,
      type: "restaurant",
      name: "Le Comptoir du Relais",
      address: "9 Carrefour de l'Odéon",
      city: "Paris",
      country: "France",
      coordinates: { latitude: 48.8522, longitude: 2.3387 },
      notes: "Reservation for 2 people at 8 PM",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "3",
      tripId: t1,
      type: "activity",
      name: "Louvre Museum",
      address: "Rue de Rivoli",
      city: "Paris",
      country: "France",
      coordinates: { latitude: 48.8606, longitude: 2.3376 },
      website: "https://louvre.fr",
      notes: "Skip-the-line tickets purchased",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "4",
      tripId: t2,
      type: "hotel",
      name: "Park Hyatt Tokyo",
      address: "3-7-1-2 Nishi-Shinjuku",
      city: "Tokyo",
      country: "Japan",
      coordinates: { latitude: 35.6762, longitude: 139.6503 },
      phone: "+81 3-5322-1234",
      website: "https://tokyo.park.hyatt.com",
      notes: "Luxury hotel with city views",
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: "5",
      tripId: t2,
      type: "activity",
      name: "Tokyo Skytree",
      address: "1-1-2 Oshiage",
      city: "Tokyo",
      country: "Japan",
      coordinates: { latitude: 35.7101, longitude: 139.8107 },
      website: "https://tokyo-skytree.jp",
      notes: "Observation deck tickets for 10 AM",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  const [uc, tc, bc, ac] = await Promise.all([
    users.countDocuments(),
    trips.countDocuments(),
    bookings.countDocuments(),
    addresses.countDocuments(),
  ]);

  console.log(
    `[seed] Done. Counts -> users=${uc} trips=${tc} bookings=${bc} addresses=${ac}`
  );
  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Script de configuration MongoDB pour MyTripCircle
// À exécuter dans MongoDB Compass ou mongo shell

// 1. Créer la base de données
use("mytripcircle");

// 2. Créer les collections avec validation
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "createdAt", "updatedAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
        name: { bsonType: "string" },
        avatar: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  },
});

db.createCollection("trips", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "title",
        "destination",
        "startDate",
        "endDate",
        "ownerId",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        title: { bsonType: "string" },
        destination: { bsonType: "string" },
        startDate: { bsonType: "date" },
        endDate: { bsonType: "date" },
        ownerId: { bsonType: "objectId" },
        isPublic: { bsonType: "bool" },
      },
    },
  },
});

db.createCollection("bookings");
db.createCollection("addresses");
db.createCollection("trip_invitations");
db.createCollection("notifications");
db.createCollection("trip_templates");

// 3. Créer les index pour optimiser les performances

// Index pour les utilisateurs
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "friends.userId": 1 });
db.users.createIndex({ createdAt: -1 });

// Index pour les voyages
db.trips.createIndex({ ownerId: 1 });
db.trips.createIndex({ "collaborators.userId": 1 });
db.trips.createIndex({ location: "2dsphere" });
db.trips.createIndex({ startDate: 1, endDate: 1 });
db.trips.createIndex({ isPublic: 1, createdAt: -1 });
db.trips.createIndex({ tags: 1 });
db.trips.createIndex({
  destination: "text",
  title: "text",
  description: "text",
});

// Index pour les réservations
db.bookings.createIndex({ tripId: 1 });
db.bookings.createIndex({ type: 1 });
db.bookings.createIndex({ date: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ createdBy: 1 });
db.bookings.createIndex({ tripId: 1, date: 1 });

// Index pour les adresses
db.addresses.createIndex({ tripId: 1 });
db.addresses.createIndex({ type: 1 });
db.addresses.createIndex({ location: "2dsphere" });
db.addresses.createIndex({ isPublic: 1 });
db.addresses.createIndex({ tags: 1 });
db.addresses.createIndex({ name: "text", address: "text", city: "text" });

// Index pour les invitations
db.trip_invitations.createIndex({ tripId: 1 });
db.trip_invitations.createIndex({ inviterId: 1 });
db.trip_invitations.createIndex({ inviteeEmail: 1 });
db.trip_invitations.createIndex({ token: 1 }, { unique: true });
db.trip_invitations.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index pour les notifications
db.notifications.createIndex({ userId: 1, read: 1 });
db.notifications.createIndex({ createdAt: -1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.notifications.createIndex({ type: 1 });

// Index pour les templates
db.trip_templates.createIndex({ isPublic: 1 });
db.trip_templates.createIndex({ category: 1 });
db.trip_templates.createIndex({ tags: 1 });
db.trip_templates.createIndex({ usageCount: -1 });
db.trip_templates.createIndex({ name: "text", description: "text" });

// 4. Insérer des données de test
print("Insertion des données de test...");

// Utilisateur de test
db.users.insertOne({
  email: "test@mytripcircle.com",
  name: "Utilisateur Test",
  avatar: "https://via.placeholder.com/150",
  createdAt: new Date(),
  updatedAt: new Date(),
  friends: [],
  preferences: {
    language: "fr",
    timezone: "Europe/Paris",
    notifications: {
      email: true,
      push: true,
      tripUpdates: true,
      friendRequests: true,
    },
  },
  stats: {
    totalTrips: 0,
    totalBookings: 0,
    totalAddresses: 0,
  },
});

// Template de voyage de test
db.trip_templates.insertOne({
  name: "Week-end à Paris",
  description: "Template pour un week-end parfait à Paris",
  templateData: {
    destination: "Paris, France",
    duration: 2,
    budget: 500,
    currency: "EUR",
    suggestedBookings: [
      {
        type: "hotel",
        title: "Hôtel 4 étoiles",
        price: 150,
      },
      {
        type: "restaurant",
        title: "Restaurant gastronomique",
        price: 80,
      },
    ],
    suggestedAddresses: [
      {
        type: "activity",
        name: "Tour Eiffel",
        address: "Champ de Mars, 7e arrondissement, Paris",
      },
      {
        type: "restaurant",
        name: "Le Comptoir du Relais",
        address: "9 Carrefour de l'Odéon, Paris",
      },
    ],
  },
  isPublic: true,
  createdBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  usageCount: 0,
  tags: ["weekend", "paris", "culture"],
  category: "city_break",
});

print("Configuration MongoDB terminée !");
print("Base de données: mytripcircle");
print(
  "Collections créées: users, trips, bookings, addresses, trip_invitations, notifications, trip_templates"
);
print("Index créés pour optimiser les performances");
print("Données de test insérées");

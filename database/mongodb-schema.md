# MongoDB Schema pour MyTripCircle

## 📊 Collections et Documents

### 1. **Collection: users**

```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  name: "John Doe",
  avatar: "https://...",
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),

  // Relations
  friends: [
    {
      userId: ObjectId("..."),
      status: "accepted", // "pending", "accepted", "blocked"
      addedAt: ISODate("2024-01-15T10:30:00Z")
    }
  ],

  // Préférences
  preferences: {
    language: "fr",
    timezone: "Europe/Paris",
    notifications: {
      email: true,
      push: true,
      tripUpdates: true,
      friendRequests: true
    }
  },

  // Statistiques
  stats: {
    totalTrips: 5,
    totalBookings: 23,
    totalAddresses: 12
  }
}
```

### 2. **Collection: trips**

```javascript
{
  _id: ObjectId("..."),
  title: "Aventure Parisienne",
  description: "Un voyage romantique dans la Ville Lumière",
  destination: "Paris, France",

  // Dates
  startDate: ISODate("2024-03-15T00:00:00Z"),
  endDate: ISODate("2024-03-22T00:00:00Z"),

  // Propriétaire et collaborateurs
  ownerId: ObjectId("..."),
  collaborators: [
    {
      userId: ObjectId("..."),
      role: "editor", // "owner", "editor", "viewer"
      joinedAt: ISODate("2024-01-15T10:30:00Z"),
      permissions: {
        canEdit: true,
        canInvite: false,
        canDelete: false
      }
    }
  ],

  // Visibilité
  isPublic: false,
  visibility: "private", // "private", "friends", "public"

  // Métadonnées
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),

  // Statistiques
  stats: {
    totalBookings: 8,
    totalAddresses: 5,
    totalCollaborators: 3
  },

  // Géolocalisation (pour recherche)
  location: {
    type: "Point",
    coordinates: [2.3522, 48.8566] // [longitude, latitude]
  },

  // Tags pour recherche
  tags: ["culture", "gastronomie", "romantique"],

  // Couverture
  coverImage: "https://...",

  // Budget
  budget: {
    total: 1500,
    currency: "EUR",
    spent: 850,
    remaining: 650
  }
}
```

### 3. **Collection: bookings**

```javascript
{
  _id: ObjectId("..."),
  tripId: ObjectId("..."),

  // Type et détails
  type: "flight", // "flight", "train", "hotel", "restaurant", "activity"
  title: "Vol Paris-Londres",
  description: "Vol aller-retour vers Londres",

  // Date et heure
  date: ISODate("2024-03-15T14:30:00Z"),
  time: "14:30",
  duration: "2h30", // pour les activités

  // Localisation
  address: "Aéroport Charles de Gaulle",
  location: {
    type: "Point",
    coordinates: [2.5476, 49.0097]
  },

  // Réservation
  confirmationNumber: "ABC123",
  status: "confirmed", // "confirmed", "pending", "cancelled"

  // Prix
  price: 450,
  currency: "EUR",
  paidBy: ObjectId("..."), // userId qui a payé

  // Fournisseur
  provider: {
    name: "Air France",
    website: "https://airfrance.com",
    phone: "+33 1 42 56 78 90"
  },

  // Pièces jointes
  attachments: [
    {
      type: "image", // "image", "pdf", "document"
      url: "https://...",
      name: "billet.pdf",
      size: 1024000
    }
  ],

  // Métadonnées
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  createdBy: ObjectId("..."),

  // Rappels
  reminders: [
    {
      type: "checkin", // "checkin", "departure", "arrival"
      date: ISODate("2024-03-15T12:00:00Z"),
      sent: false
    }
  ],

  // Notes
  notes: "N'oubliez pas de faire le check-in en ligne"
}
```

### 4. **Collection: addresses**

```javascript
{
  _id: ObjectId("..."),
  tripId: ObjectId("..."),

  // Type et nom
  type: "hotel", // "hotel", "restaurant", "activity", "transport", "other"
  name: "Hôtel Le Marais",

  // Adresse complète
  address: "123 Rue de Rivoli",
  city: "Paris",
  country: "France",
  postalCode: "75001",

  // Géolocalisation
  location: {
    type: "Point",
    coordinates: [2.3522, 48.8566]
  },

  // Contact
  contact: {
    phone: "+33 1 42 36 78 90",
    email: "contact@hotelmarais.com",
    website: "https://hotelmarais.com"
  },

  // Détails
  description: "Hôtel 4 étoiles au cœur du Marais",
  notes: "Check-in à 15h, check-out à 11h",

  // Horaires
  openingHours: {
    monday: "24h",
    tuesday: "24h",
    // ...
  },

  // Évaluations
  rating: 4.5,
  reviews: [
    {
      userId: ObjectId("..."),
      rating: 5,
      comment: "Excellent hôtel !",
      date: ISODate("2024-01-15T10:30:00Z")
    }
  ],

  // Métadonnées
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),
  createdBy: ObjectId("..."),

  // Visibilité
  isPublic: true,

  // Tags
  tags: ["luxe", "centre-ville", "historique"]
}
```

### 5. **Collection: trip_invitations**

```javascript
{
  _id: ObjectId("..."),
  tripId: ObjectId("..."),
  inviterId: ObjectId("..."),
  inviteeEmail: "friend@example.com",

  // Statut
  status: "pending", // "pending", "accepted", "declined", "expired"

  // Token de sécurité
  token: "abc123def456",
  expiresAt: ISODate("2024-02-15T10:30:00Z"),

  // Permissions proposées
  permissions: {
    role: "editor", // "viewer", "editor"
    canEdit: true,
    canInvite: false,
    canDelete: false
  },

  // Métadonnées
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  respondedAt: ISODate("2024-01-16T14:20:00Z"),

  // Message personnalisé
  message: "Rejoins-moi pour ce super voyage à Paris !"
}
```

### 6. **Collection: notifications**

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),

  // Type de notification
  type: "trip_update", // "trip_update", "booking_added", "friend_request", "invitation"

  // Contenu
  title: "Nouveau voyage ajouté",
  message: "John a ajouté un nouveau voyage à Paris",

  // Données liées
  data: {
    tripId: ObjectId("..."),
    action: "created",
    actorId: ObjectId("...")
  },

  // Statut
  read: false,
  readAt: null,

  // Métadonnées
  createdAt: ISODate("2024-01-15T10:30:00Z"),

  // Priorité
  priority: "normal", // "low", "normal", "high", "urgent"

  // Canal
  channels: ["push", "email"], // "push", "email", "sms"

  // Expiration
  expiresAt: ISODate("2024-02-15T10:30:00Z")
}
```

### 7. **Collection: trip_templates**

```javascript
{
  _id: ObjectId("..."),
  name: "Week-end à Paris",
  description: "Template pour un week-end parfait à Paris",

  // Données du template
  templateData: {
    destination: "Paris, France",
    duration: 2, // jours
    budget: 500,
    currency: "EUR",

    // Bookings suggérés
    suggestedBookings: [
      {
        type: "hotel",
        title: "Hôtel recommandé",
        price: 150
      }
    ],

    // Adresses suggérées
    suggestedAddresses: [
      {
        type: "restaurant",
        name: "Restaurant recommandé",
        address: "Adresse recommandée"
      }
    ]
  },

  // Métadonnées
  isPublic: true,
  createdBy: ObjectId("..."),
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z"),

  // Statistiques d'utilisation
  usageCount: 25,

  // Tags
  tags: ["weekend", "paris", "culture"],

  // Catégorie
  category: "city_break"
}
```

## 🔍 **Index MongoDB recommandés**

```javascript
// Collection: trips
db.trips.createIndex({ ownerId: 1 });
db.trips.createIndex({ "collaborators.userId": 1 });
db.trips.createIndex({ location: "2dsphere" });
db.trips.createIndex({ startDate: 1, endDate: 1 });
db.trips.createIndex({ isPublic: 1, createdAt: -1 });

// Collection: bookings
db.bookings.createIndex({ tripId: 1 });
db.bookings.createIndex({ type: 1 });
db.bookings.createIndex({ date: 1 });
db.bookings.createIndex({ status: 1 });

// Collection: addresses
db.addresses.createIndex({ tripId: 1 });
db.addresses.createIndex({ type: 1 });
db.addresses.createIndex({ location: "2dsphere" });
db.addresses.createIndex({ isPublic: 1 });

// Collection: users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "friends.userId": 1 });

// Collection: notifications
db.notifications.createIndex({ userId: 1, read: 1 });
db.notifications.createIndex({ createdAt: -1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## 📊 **Agrégations utiles**

### Statistiques d'un utilisateur

```javascript
db.users.aggregate([
  { $match: { _id: ObjectId("...") } },
  {
    $lookup: {
      from: "trips",
      localField: "_id",
      foreignField: "ownerId",
      as: "ownedTrips",
    },
  },
  {
    $lookup: {
      from: "bookings",
      localField: "_id",
      foreignField: "createdBy",
      as: "bookings",
    },
  },
  {
    $project: {
      name: 1,
      email: 1,
      stats: {
        totalTrips: { $size: "$ownedTrips" },
        totalBookings: { $size: "$bookings" },
        totalSpent: { $sum: "$bookings.price" },
      },
    },
  },
]);
```

### Recherche de voyages par géolocalisation

```javascript
db.trips.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [2.3522, 48.8566],
      },
      $maxDistance: 10000, // 10km
    },
  },
});
```

Ce schéma MongoDB est optimisé pour votre application MyTripCircle avec toutes les fonctionnalités de collaboration, géolocalisation, et gestion des données ! 🚀

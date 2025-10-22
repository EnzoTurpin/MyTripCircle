# Guide de Migration AsyncStorage → MongoDB

## 🚀 **Étapes de Migration**

### 1. **Installation des dépendances MongoDB**

```bash
npm install mongodb
npm install @types/mongodb --save-dev
```

### 2. **Configuration de la connexion**

Créer un fichier `.env` :

```env
MONGODB_URI=mongodb://localhost:27017/mytripcircle
# ou pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mytripcircle
```

### 3. **Migration des données existantes**

```typescript
// src/services/MigrationService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import MongoDBService from "./MongoDBService";

class MigrationService {
  private mongoService = MongoDBService.getInstance();

  async migrateFromAsyncStorage(): Promise<void> {
    try {
      // 1. Migrer les utilisateurs
      await this.migrateUsers();

      // 2. Migrer les voyages
      await this.migrateTrips();

      // 3. Migrer les réservations
      await this.migrateBookings();

      // 4. Migrer les adresses
      await this.migrateAddresses();

      console.log("Migration terminée avec succès");
    } catch (error) {
      console.error("Erreur lors de la migration:", error);
      throw error;
    }
  }

  private async migrateUsers(): Promise<void> {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      await this.mongoService.createUser({
        email: user.email,
        name: user.name,
        avatar: user.avatar,
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
    }
  }

  private async migrateTrips(): Promise<void> {
    const tripsData = await AsyncStorage.getItem("mytripcircle_trips");
    if (tripsData) {
      const trips = JSON.parse(tripsData);
      for (const trip of trips) {
        await this.mongoService.createTrip({
          title: trip.title,
          description: trip.description,
          destination: trip.destination,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          ownerId: trip.ownerId,
          collaborators: trip.collaborators.map((id: string) => ({
            userId: id,
            role: "editor" as const,
            joinedAt: new Date(),
            permissions: {
              canEdit: true,
              canInvite: false,
              canDelete: false,
            },
          })),
          isPublic: trip.isPublic,
          visibility: "private" as const,
          stats: {
            totalBookings: 0,
            totalAddresses: 0,
            totalCollaborators: trip.collaborators.length,
          },
          location: {
            type: "Point" as const,
            coordinates: [0, 0], // À remplacer par les vraies coordonnées
          },
          tags: [],
          coverImage: trip.coverImage,
        });
      }
    }
  }

  private async migrateBookings(): Promise<void> {
    const bookingsData = await AsyncStorage.getItem("mytripcircle_bookings");
    if (bookingsData) {
      const bookings = JSON.parse(bookingsData);
      for (const booking of bookings) {
        await this.mongoService.createBooking({
          tripId: booking.tripId,
          type: booking.type,
          title: booking.title,
          description: booking.description,
          date: new Date(booking.date),
          time: booking.time,
          address: booking.address,
          confirmationNumber: booking.confirmationNumber,
          status: booking.status,
          price: booking.price,
          currency: booking.currency,
          createdBy: booking.createdBy || "unknown",
          notes: booking.notes,
        });
      }
    }
  }

  private async migrateAddresses(): Promise<void> {
    const addressesData = await AsyncStorage.getItem("mytripcircle_addresses");
    if (addressesData) {
      const addresses = JSON.parse(addressesData);
      for (const address of addresses) {
        await this.mongoService.createAddress({
          tripId: address.tripId,
          type: address.type,
          name: address.name,
          address: address.address,
          city: address.city,
          country: address.country,
          location: address.coordinates
            ? {
                type: "Point" as const,
                coordinates: [
                  address.coordinates.longitude,
                  address.coordinates.latitude,
                ],
              }
            : {
                type: "Point" as const,
                coordinates: [0, 0],
              },
          contact: {
            phone: address.phone,
            website: address.website,
          },
          description: address.description,
          notes: address.notes,
          createdBy: address.createdBy || "unknown",
          isPublic: address.isPublic || false,
          tags: address.tags || [],
        });
      }
    }
  }
}

export default MigrationService;
```

### 4. **Mise à jour des Contextes**

```typescript
// src/contexts/TripsContext.tsx - Version MongoDB
import { useEffect, useState } from "react";
import MongoDBService from "../services/MongoDBService";

export const TripsProvider: React.FC<TripsProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const mongoService = MongoDBService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger depuis MongoDB au lieu d'AsyncStorage
      const [tripsData, bookingsData, addressesData] = await Promise.all([
        mongoService.getTripsByUserId(currentUserId),
        mongoService.getBookingsByTripId(currentTripId),
        mongoService.getAddressesByTripId(currentTripId),
      ]);

      setTrips(tripsData);
      setBookings(bookingsData);
      setAddresses(addressesData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... reste des méthodes mises à jour pour utiliser MongoDB
};
```

### 5. **Configuration de la connexion MongoDB**

```typescript
// src/config/database.ts
import MongoDBService from "../services/MongoDBService";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mytripcircle";

export const initializeDatabase = async (): Promise<void> => {
  try {
    await MongoDBService.getInstance().connect(MONGODB_URI);
    console.log("Base de données MongoDB initialisée");
  } catch (error) {
    console.error("Erreur d'initialisation de la base de données:", error);
    throw error;
  }
};
```

### 6. **Mise à jour du App.tsx**

```typescript
// App.tsx
import React, { useEffect } from "react";
import { initializeDatabase } from "./src/config/database";
import { AuthProvider } from "./src/contexts/AuthContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <AuthProvider>
      <TripsProvider>
        <AppNavigator />
      </TripsProvider>
    </AuthProvider>
  );
}
```

## 🔄 **Stratégie de Migration Progressive**

### Phase 1: Double écriture

- Écrire dans AsyncStorage ET MongoDB
- Lire depuis AsyncStorage (pour la compatibilité)

### Phase 2: Migration des données

- Migrer toutes les données existantes
- Vérifier l'intégrité des données

### Phase 3: Basculement

- Lire depuis MongoDB
- Arrêter d'écrire dans AsyncStorage

### Phase 4: Nettoyage

- Supprimer AsyncStorage
- Nettoyer le code

## 📊 **Avantages de MongoDB vs AsyncStorage**

| Fonctionnalité      | AsyncStorage     | MongoDB                   |
| ------------------- | ---------------- | ------------------------- |
| **Stockage**        | Local uniquement | Cloud + Local             |
| **Collaboration**   | ❌               | ✅ Temps réel             |
| **Recherche**       | Basique          | Avancée + Géolocalisation |
| **Scalabilité**     | Limitée          | Illimitée                 |
| **Sauvegarde**      | Manuelle         | Automatique               |
| **Synchronisation** | ❌               | ✅                        |
| **Notifications**   | ❌               | ✅ Push                   |

## 🚨 **Points d'attention**

1. **Gestion des erreurs** : MongoDB peut être indisponible
2. **Mode hors ligne** : Garder AsyncStorage comme fallback
3. **Performance** : MongoDB peut être plus lent pour les petites données
4. **Coûts** : MongoDB Atlas a des limites gratuites

## 🎯 **Prochaines étapes**

1. Installer MongoDB localement ou utiliser MongoDB Atlas
2. Exécuter le script de configuration
3. Tester la connexion
4. Migrer progressivement les données
5. Mettre à jour les contextes
6. Tester toutes les fonctionnalités

Votre application MyTripCircle sera alors prête pour la collaboration en temps réel ! 🚀

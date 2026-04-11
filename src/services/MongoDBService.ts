import { MongoClient, Db, Collection, Filter } from "mongodb";
import {
  User,
  Trip,
  Booking,
  Address,
  TripInvitation,
  Notification,
  TripTemplate,
  TripQuery,
  BookingQuery,
  AddressQuery,
} from "../types/mongodb";

type NewMongoFields = "_id" | "createdAt" | "updatedAt";

class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  private users: Collection<User> | null = null;
  private trips: Collection<Trip> | null = null;
  private bookings: Collection<Booking> | null = null;
  private addresses: Collection<Address> | null = null;
  private tripInvitations: Collection<TripInvitation> | null = null;
  private notifications: Collection<Notification> | null = null;
  private tripTemplates: Collection<TripTemplate> | null = null;

  private constructor() {}

  static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  async connect(connectionString: string, dbName = "mytripcircle"): Promise<void> {
    try {
      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;

      this.users = this.db.collection<User>("users");
      this.trips = this.db.collection<Trip>("trips");
      this.bookings = this.db.collection<Booking>("bookings");
      this.addresses = this.db.collection<Address>("addresses");
      this.tripInvitations = this.db.collection<TripInvitation>("trip_invitations");
      this.notifications = this.db.collection<Notification>("notifications");
      this.tripTemplates = this.db.collection<TripTemplate>("trip_templates");

      console.log("MongoDB connecté avec succès");
    } catch (error) {
      console.error("Erreur de connexion MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log("MongoDB déconnecté");
    }
  }

  // === HELPERS PRIVÉS ===

  private requireCollection<T extends object>(collection: Collection<T> | null): Collection<T> {
    if (!collection) throw new Error("MongoDB non connecté");
    return collection;
  }

  private async insertDocument<T extends object>(
    collection: Collection<T>,
    data: Omit<T, NewMongoFields>
  ): Promise<T> {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() } as T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await collection.insertOne(doc as any);
    return { ...doc, _id: result.insertedId.toString() };
  }

  private async updateDocument<T extends object>(
    collection: Collection<T>,
    filter: Filter<T>,
    updates: Partial<T>
  ): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return collection.findOneAndUpdate(
      filter,
      { $set: { ...updates, updatedAt: new Date() } } as any,
      { returnDocument: "after" }
    ) as unknown as Promise<T | null>;
  }

  private async deleteDocument<T extends object>(
    collection: Collection<T>,
    filter: Filter<T>
  ): Promise<boolean> {
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  }

  // === GESTION DES UTILISATEURS ===

  async createUser(userData: Omit<User, NewMongoFields>): Promise<User> {
    return this.insertDocument(this.requireCollection(this.users), userData);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.requireCollection(this.users).findOne({ _id: userId });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.requireCollection(this.users).findOne({ email });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    return this.updateDocument(this.requireCollection(this.users), { _id: userId }, updates);
  }

  // === GESTION DES VOYAGES ===

  async createTrip(tripData: Omit<Trip, NewMongoFields>): Promise<Trip> {
    return this.insertDocument(this.requireCollection(this.trips), tripData);
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    return this.requireCollection(this.trips)
      .find({ $or: [{ ownerId: userId }, { "collaborators.userId": userId }] })
      .toArray();
  }

  async getTripById(tripId: string): Promise<Trip | null> {
    return this.requireCollection(this.trips).findOne({ _id: tripId });
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    return this.updateDocument(this.requireCollection(this.trips), { _id: tripId }, updates);
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    return this.deleteDocument(this.requireCollection(this.trips), { _id: tripId });
  }

  async searchTrips(query: TripQuery): Promise<Trip[]> {
    return this.requireCollection(this.trips).find(query).toArray();
  }

  // === GESTION DES RÉSERVATIONS ===

  async createBooking(bookingData: Omit<Booking, NewMongoFields>): Promise<Booking> {
    return this.insertDocument(this.requireCollection(this.bookings), bookingData);
  }

  async getBookingsByTripId(tripId: string): Promise<Booking[]> {
    return this.requireCollection(this.bookings).find({ tripId }).toArray();
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    return this.requireCollection(this.bookings).findOne({ _id: bookingId });
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking | null> {
    return this.updateDocument(this.requireCollection(this.bookings), { _id: bookingId }, updates);
  }

  async deleteBooking(bookingId: string): Promise<boolean> {
    return this.deleteDocument(this.requireCollection(this.bookings), { _id: bookingId });
  }

  async searchBookings(query: BookingQuery): Promise<Booking[]> {
    return this.requireCollection(this.bookings).find(query).toArray();
  }

  // === GESTION DES ADRESSES ===

  async createAddress(addressData: Omit<Address, NewMongoFields>): Promise<Address> {
    return this.insertDocument(this.requireCollection(this.addresses), addressData);
  }

  async getAddressesByTripId(tripId: string): Promise<Address[]> {
    return this.requireCollection(this.addresses).find({ tripId }).toArray();
  }

  async getAddressById(addressId: string): Promise<Address | null> {
    return this.requireCollection(this.addresses).findOne({ _id: addressId });
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<Address | null> {
    return this.updateDocument(this.requireCollection(this.addresses), { _id: addressId }, updates);
  }

  async deleteAddress(addressId: string): Promise<boolean> {
    return this.deleteDocument(this.requireCollection(this.addresses), { _id: addressId });
  }

  async searchAddresses(query: AddressQuery): Promise<Address[]> {
    return this.requireCollection(this.addresses).find(query).toArray();
  }

  // === GESTION DES INVITATIONS ===

  async createInvitation(
    invitationData: Omit<TripInvitation, "_id" | "createdAt">
  ): Promise<TripInvitation> {
    const col = this.requireCollection(this.tripInvitations);
    const invitation: TripInvitation = { ...invitationData, createdAt: new Date() };
    const result = await col.insertOne(invitation);
    return { ...invitation, _id: result.insertedId.toString() };
  }

  async getInvitationByToken(token: string): Promise<TripInvitation | null> {
    return this.requireCollection(this.tripInvitations).findOne({ token });
  }

  async updateInvitationStatus(
    token: string,
    status: TripInvitation["status"]
  ): Promise<TripInvitation | null> {
    return this.requireCollection(this.tripInvitations).findOneAndUpdate(
      { token },
      { $set: { status, respondedAt: new Date() } },
      { returnDocument: "after" }
    );
  }

  // === GESTION DES NOTIFICATIONS ===

  async createNotification(
    notificationData: Omit<Notification, "_id" | "createdAt">
  ): Promise<Notification> {
    const col = this.requireCollection(this.notifications);
    const notification: Notification = { ...notificationData, createdAt: new Date() };
    const result = await col.insertOne(notification);
    return { ...notification, _id: result.insertedId.toString() };
  }

  async getNotificationsByUserId(userId: string, limit = 50): Promise<Notification[]> {
    return this.requireCollection(this.notifications)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const result = await this.requireCollection(this.notifications).updateOne(
      { _id: notificationId },
      { $set: { read: true, readAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  // === GESTION DES TEMPLATES ===

  async getTripTemplates(category?: string): Promise<TripTemplate[]> {
    const query = category ? { category, isPublic: true } : { isPublic: true };
    return this.requireCollection(this.tripTemplates)
      .find(query)
      .sort({ usageCount: -1 })
      .toArray();
  }

  async getTripTemplateById(templateId: string): Promise<TripTemplate | null> {
    return this.requireCollection(this.tripTemplates).findOne({ _id: templateId });
  }

  async incrementTemplateUsage(templateId: string): Promise<boolean> {
    const result = await this.requireCollection(this.tripTemplates).updateOne(
      { _id: templateId },
      { $inc: { usageCount: 1 } }
    );
    return result.modifiedCount > 0;
  }

  // === MÉTHODES UTILITAIRES ===

  async checkConnection(): Promise<boolean> {
    return this.isConnected;
  }

  async getStats(): Promise<{ users: number; trips: number; bookings: number; addresses: number }> {
    if (!this.db) throw new Error("MongoDB non connecté");

    const [users, trips, bookings, addresses] = await Promise.all([
      this.users?.countDocuments() ?? 0,
      this.trips?.countDocuments() ?? 0,
      this.bookings?.countDocuments() ?? 0,
      this.addresses?.countDocuments() ?? 0,
    ]);

    return { users, trips, bookings, addresses };
  }
}

export default MongoDBService;

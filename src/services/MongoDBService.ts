// Service MongoDB pour MyTripCircle
import { MongoClient, Db, Collection } from "mongodb";
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

class MongoDBService {
  private static instance: MongoDBService;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  // Collections
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

  async connect(
    connectionString: string,
    dbName: string = "mytripcircle"
  ): Promise<void> {
    try {
      this.client = new MongoClient(connectionString);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;

      // Initialiser les collections
      this.users = this.db.collection<User>("users");
      this.trips = this.db.collection<Trip>("trips");
      this.bookings = this.db.collection<Booking>("bookings");
      this.addresses = this.db.collection<Address>("addresses");
      this.tripInvitations =
        this.db.collection<TripInvitation>("trip_invitations");
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

  // === GESTION DES UTILISATEURS ===
  async createUser(
    userData: Omit<User, "_id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    if (!this.users) throw new Error("MongoDB non connecté");

    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.users.insertOne(user);
    return { ...user, _id: result.insertedId.toString() };
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!this.users) throw new Error("MongoDB non connecté");
    return await this.users.findOne({ _id: userId });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.users) throw new Error("MongoDB non connecté");
    return await this.users.findOne({ email });
  }

  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User | null> {
    if (!this.users) throw new Error("MongoDB non connecté");

    const result = await this.users.findOneAndUpdate(
      { _id: userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result;
  }

  // === GESTION DES VOYAGES ===
  async createTrip(
    tripData: Omit<Trip, "_id" | "createdAt" | "updatedAt">
  ): Promise<Trip> {
    if (!this.trips) throw new Error("MongoDB non connecté");

    const trip: Trip = {
      ...tripData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.trips.insertOne(trip);
    return { ...trip, _id: result.insertedId.toString() };
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    if (!this.trips) throw new Error("MongoDB non connecté");

    return await this.trips
      .find({
        $or: [{ ownerId: userId }, { "collaborators.userId": userId }],
      })
      .toArray();
  }

  async getTripById(tripId: string): Promise<Trip | null> {
    if (!this.trips) throw new Error("MongoDB non connecté");
    return await this.trips.findOne({ _id: tripId });
  }

  async updateTrip(
    tripId: string,
    updates: Partial<Trip>
  ): Promise<Trip | null> {
    if (!this.trips) throw new Error("MongoDB non connecté");

    const result = await this.trips.findOneAndUpdate(
      { _id: tripId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result;
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    if (!this.trips) throw new Error("MongoDB non connecté");

    const result = await this.trips.deleteOne({ _id: tripId });
    return result.deletedCount > 0;
  }

  async searchTrips(query: TripQuery): Promise<Trip[]> {
    if (!this.trips) throw new Error("MongoDB non connecté");
    return await this.trips.find(query).toArray();
  }

  // === GESTION DES RÉSERVATIONS ===
  async createBooking(
    bookingData: Omit<Booking, "_id" | "createdAt" | "updatedAt">
  ): Promise<Booking> {
    if (!this.bookings) throw new Error("MongoDB non connecté");

    const booking: Booking = {
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.bookings.insertOne(booking);
    return { ...booking, _id: result.insertedId.toString() };
  }

  async getBookingsByTripId(tripId: string): Promise<Booking[]> {
    if (!this.bookings) throw new Error("MongoDB non connecté");
    return await this.bookings.find({ tripId }).toArray();
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    if (!this.bookings) throw new Error("MongoDB non connecté");
    return await this.bookings.findOne({ _id: bookingId });
  }

  async updateBooking(
    bookingId: string,
    updates: Partial<Booking>
  ): Promise<Booking | null> {
    if (!this.bookings) throw new Error("MongoDB non connecté");

    const result = await this.bookings.findOneAndUpdate(
      { _id: bookingId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result;
  }

  async deleteBooking(bookingId: string): Promise<boolean> {
    if (!this.bookings) throw new Error("MongoDB non connecté");

    const result = await this.bookings.deleteOne({ _id: bookingId });
    return result.deletedCount > 0;
  }

  async searchBookings(query: BookingQuery): Promise<Booking[]> {
    if (!this.bookings) throw new Error("MongoDB non connecté");
    return await this.bookings.find(query).toArray();
  }

  // === GESTION DES ADRESSES ===
  async createAddress(
    addressData: Omit<Address, "_id" | "createdAt" | "updatedAt">
  ): Promise<Address> {
    if (!this.addresses) throw new Error("MongoDB non connecté");

    const address: Address = {
      ...addressData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.addresses.insertOne(address);
    return { ...address, _id: result.insertedId.toString() };
  }

  async getAddressesByTripId(tripId: string): Promise<Address[]> {
    if (!this.addresses) throw new Error("MongoDB non connecté");
    return await this.addresses.find({ tripId }).toArray();
  }

  async getAddressById(addressId: string): Promise<Address | null> {
    if (!this.addresses) throw new Error("MongoDB non connecté");
    return await this.addresses.findOne({ _id: addressId });
  }

  async updateAddress(
    addressId: string,
    updates: Partial<Address>
  ): Promise<Address | null> {
    if (!this.addresses) throw new Error("MongoDB non connecté");

    const result = await this.addresses.findOneAndUpdate(
      { _id: addressId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result;
  }

  async deleteAddress(addressId: string): Promise<boolean> {
    if (!this.addresses) throw new Error("MongoDB non connecté");

    const result = await this.addresses.deleteOne({ _id: addressId });
    return result.deletedCount > 0;
  }

  async searchAddresses(query: AddressQuery): Promise<Address[]> {
    if (!this.addresses) throw new Error("MongoDB non connecté");
    return await this.addresses.find(query).toArray();
  }

  // === GESTION DES INVITATIONS ===
  async createInvitation(
    invitationData: Omit<TripInvitation, "_id" | "createdAt">
  ): Promise<TripInvitation> {
    if (!this.tripInvitations) throw new Error("MongoDB non connecté");

    const invitation: TripInvitation = {
      ...invitationData,
      createdAt: new Date(),
    };

    const result = await this.tripInvitations.insertOne(invitation);
    return { ...invitation, _id: result.insertedId.toString() };
  }

  async getInvitationByToken(token: string): Promise<TripInvitation | null> {
    if (!this.tripInvitations) throw new Error("MongoDB non connecté");
    return await this.tripInvitations.findOne({ token });
  }

  async updateInvitationStatus(
    token: string,
    status: TripInvitation["status"]
  ): Promise<TripInvitation | null> {
    if (!this.tripInvitations) throw new Error("MongoDB non connecté");

    const result = await this.tripInvitations.findOneAndUpdate(
      { token },
      { $set: { status, respondedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result;
  }

  // === GESTION DES NOTIFICATIONS ===
  async createNotification(
    notificationData: Omit<Notification, "_id" | "createdAt">
  ): Promise<Notification> {
    if (!this.notifications) throw new Error("MongoDB non connecté");

    const notification: Notification = {
      ...notificationData,
      createdAt: new Date(),
    };

    const result = await this.notifications.insertOne(notification);
    return { ...notification, _id: result.insertedId.toString() };
  }

  async getNotificationsByUserId(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    if (!this.notifications) throw new Error("MongoDB non connecté");

    return await this.notifications
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!this.notifications) throw new Error("MongoDB non connecté");

    const result = await this.notifications.updateOne(
      { _id: notificationId },
      { $set: { read: true, readAt: new Date() } }
    );

    return result.modifiedCount > 0;
  }

  // === GESTION DES TEMPLATES ===
  async getTripTemplates(category?: string): Promise<TripTemplate[]> {
    if (!this.tripTemplates) throw new Error("MongoDB non connecté");

    const query = category ? { category, isPublic: true } : { isPublic: true };
    return await this.tripTemplates
      .find(query)
      .sort({ usageCount: -1 })
      .toArray();
  }

  async getTripTemplateById(templateId: string): Promise<TripTemplate | null> {
    if (!this.tripTemplates) throw new Error("MongoDB non connecté");
    return await this.tripTemplates.findOne({ _id: templateId });
  }

  async incrementTemplateUsage(templateId: string): Promise<boolean> {
    if (!this.tripTemplates) throw new Error("MongoDB non connecté");

    const result = await this.tripTemplates.updateOne(
      { _id: templateId },
      { $inc: { usageCount: 1 } }
    );

    return result.modifiedCount > 0;
  }

  // === MÉTHODES UTILITAIRES ===
  async isConnected(): Promise<boolean> {
    return this.isConnected;
  }

  async getStats(): Promise<{
    users: number;
    trips: number;
    bookings: number;
    addresses: number;
  }> {
    if (!this.db) throw new Error("MongoDB non connecté");

    const [users, trips, bookings, addresses] = await Promise.all([
      this.users?.countDocuments() || 0,
      this.trips?.countDocuments() || 0,
      this.bookings?.countDocuments() || 0,
      this.addresses?.countDocuments() || 0,
    ]);

    return { users, trips, bookings, addresses };
  }
}

export default MongoDBService;

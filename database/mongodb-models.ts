// MongoDB Models pour MyTripCircle
// Modèles TypeScript correspondant au schéma MongoDB

export interface User {
  _id?: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;

  friends: Friend[];
  preferences: UserPreferences;
  stats: UserStats;
}

export interface Friend {
  userId: string;
  status: "pending" | "accepted" | "blocked";
  addedAt: Date;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    tripUpdates: boolean;
    friendRequests: boolean;
  };
}

export interface UserStats {
  totalTrips: number;
  totalBookings: number;
  totalAddresses: number;
}

export interface Trip {
  _id?: string;
  title: string;
  description?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  ownerId: string;
  collaborators: Collaborator[];
  isPublic: boolean;
  visibility: "private" | "friends" | "public";
  createdAt: Date;
  updatedAt: Date;
  stats: TripStats;
  location: GeoLocation;
  tags: string[];
  coverImage?: string;
  budget?: TripBudget;
}

export interface Collaborator {
  userId: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
  permissions: {
    canEdit: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
}

export interface TripStats {
  totalBookings: number;
  totalAddresses: number;
  totalCollaborators: number;
}

export interface GeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface TripBudget {
  total: number;
  currency: string;
  spent: number;
  remaining: number;
}

export interface Booking {
  _id?: string;
  tripId: string;
  type: "flight" | "train" | "hotel" | "restaurant" | "activity";
  title: string;
  description?: string;
  date: Date;
  time?: string;
  duration?: string;
  address?: string;
  location?: GeoLocation;
  confirmationNumber?: string;
  status: "confirmed" | "pending" | "cancelled";
  price?: number;
  currency?: string;
  paidBy?: string;
  provider?: BookingProvider;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  reminders?: Reminder[];
  notes?: string;
}

export interface BookingProvider {
  name: string;
  website?: string;
  phone?: string;
}

export interface Attachment {
  type: "image" | "pdf" | "document";
  url: string;
  name: string;
  size: number;
}

export interface Reminder {
  type: "checkin" | "departure" | "arrival";
  date: Date;
  sent: boolean;
}

export interface Address {
  _id?: string;
  tripId: string;
  type: "hotel" | "restaurant" | "activity" | "transport" | "other";
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  location: GeoLocation;
  contact?: AddressContact;
  description?: string;
  notes?: string;
  openingHours?: Record<string, string>;
  rating?: number;
  reviews?: AddressReview[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
}

export interface AddressContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface AddressReview {
  userId: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface TripInvitation {
  _id?: string;
  tripId: string;
  inviterId: string;
  inviteeEmail: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: Date;
  permissions: {
    role: "viewer" | "editor";
    canEdit: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
  createdAt: Date;
  respondedAt?: Date;
  message?: string;
}

export interface Notification {
  _id?: string;
  userId: string;
  type: "trip_update" | "booking_added" | "friend_request" | "invitation";
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  priority: "low" | "normal" | "high" | "urgent";
  channels: ("push" | "email" | "sms")[];
  expiresAt?: Date;
}

export interface TripTemplate {
  _id?: string;
  name: string;
  description: string;
  templateData: {
    destination: string;
    duration: number;
    budget: number;
    currency: string;
    suggestedBookings: SuggestedBooking[];
    suggestedAddresses: SuggestedAddress[];
  };
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  tags: string[];
  category: string;
}

export interface SuggestedBooking {
  type: string;
  title: string;
  price: number;
}

export interface SuggestedAddress {
  type: string;
  name: string;
  address: string;
}

// Types pour les requêtes MongoDB
export interface TripQuery {
  ownerId?: string;
  collaboratorId?: string;
  isPublic?: boolean;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  location?: {
    $near: {
      $geometry: GeoLocation;
      $maxDistance: number;
    };
  };
}

export interface BookingQuery {
  tripId?: string;
  type?: string;
  status?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface AddressQuery {
  tripId?: string;
  type?: string;
  isPublic?: boolean;
  location?: {
    $near: {
      $geometry: GeoLocation;
      $maxDistance: number;
    };
  };
}

// Types pour les agrégations
export interface UserStatsAggregation {
  _id: string;
  name: string;
  email: string;
  stats: {
    totalTrips: number;
    totalBookings: number;
    totalSpent: number;
  };
}

export interface TripStatsAggregation {
  _id: string;
  title: string;
  stats: {
    totalBookings: number;
    totalAddresses: number;
    totalCollaborators: number;
    totalSpent: number;
  };
}

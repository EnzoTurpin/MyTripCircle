// MongoDB-specific types (using _id instead of id)

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  passwordHash?: string;
  password?: string;
  verified?: boolean;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collaborator {
  userId: string;
  role?: "owner" | "editor" | "viewer";
  joinedAt?: Date;
  permissions?: {
    canEdit: boolean;
    canInvite: boolean;
    canDelete: boolean;
  };
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
  status: "draft" | "validated";
  coverImage?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  _id?: string;
  tripId: string;
  type: "flight" | "train" | "hotel" | "restaurant" | "activity";
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  time?: string;
  address?: string;
  confirmationNumber?: string;
  price?: number;
  currency?: string;
  status: "confirmed" | "pending" | "cancelled";
  attachments?: string[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  _id?: string;
  type: "hotel" | "restaurant" | "activity" | "transport" | "other";
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  website?: string;
  notes?: string;
  tripId?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripInvitation {
  _id?: string;
  tripId: string;
  inviterId: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: Date;
  respondedAt?: Date;
  createdAt: Date;
}

export interface Notification {
  _id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface TripTemplate {
  _id?: string;
  title: string;
  description?: string;
  category: string;
  destination?: string;
  duration?: number;
  isPublic: boolean;
  usageCount: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TripQuery = Partial<Pick<Trip, "ownerId" | "status" | "visibility">> & Record<string, any>;
export type BookingQuery = Partial<Pick<Booking, "tripId" | "type" | "status">> & Record<string, any>;
export type AddressQuery = Partial<Pick<Address, "tripId" | "type" | "userId">> & Record<string, any>;

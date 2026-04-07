import { Trip, Booking, Address, TripInvitation } from "../types";

export function mapCollaborator(collab: any, defaultRole: "viewer" | "editor" = "viewer") {
  if (typeof collab === "string") {
    return {
      userId: collab,
      role: defaultRole,
      joinedAt: new Date(),
      permissions: {
        canEdit: defaultRole === "editor",
        canInvite: false,
        canDelete: false,
      },
    };
  }
  return {
    userId: collab.userId || collab,
    role: collab.role || defaultRole,
    joinedAt: collab.joinedAt ? new Date(collab.joinedAt) : new Date(),
    permissions: collab.permissions || {
      canEdit: defaultRole === "editor",
      canInvite: false,
      canDelete: false,
    },
    invitedBy: collab.invitedBy,
  };
}

export function mapTrip(raw: any): Trip {
  return {
    id: raw._id ?? raw.id,
    title: raw.title,
    description: raw.description,
    destination: raw.destination,
    coverImage: raw.coverImage,
    startDate: raw.startDate ? new Date(raw.startDate) : new Date(),
    endDate: raw.endDate ? new Date(raw.endDate) : new Date(),
    ownerId: raw.ownerId,
    collaborators: raw.collaborators
      ? raw.collaborators.map((c: any) => mapCollaborator(c, "viewer"))
      : [],
    isPublic: raw.isPublic,
    visibility: raw.visibility || (raw.isPublic ? "public" : "private"),
    status: raw.status || "draft",
    stats: raw.stats || {
      totalBookings: 0,
      totalAddresses: 0,
      totalCollaborators: 0,
    },
    location: raw.location || { type: "Point", coordinates: [0, 0] },
    tags: raw.tags || [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

export function mapTripFromCreate(raw: any): Trip {
  return {
    ...mapTrip(raw),
    collaborators: raw.collaborators
      ? raw.collaborators.map((c: any) => mapCollaborator(c, "editor"))
      : [],
    status: raw.status || "draft",
  };
}

export function mapBooking(raw: any): Booking {
  return {
    id: raw._id ?? raw.id,
    tripId: raw.tripId || "",
    type: raw.type,
    title: raw.title,
    description: raw.description,
    date: raw.date ? new Date(raw.date) : new Date(),
    endDate: raw.endDate ? new Date(raw.endDate) : undefined,
    time: raw.time,
    address: raw.address,
    confirmationNumber: raw.confirmationNumber,
    price: raw.price,
    currency: raw.currency || "EUR",
    status: raw.status || "pending",
    attachments: raw.attachments || [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

export function mapAddress(raw: any): Address {
  return {
    id: raw._id ?? raw.id,
    type: raw.type,
    name: raw.name,
    address: raw.address,
    city: raw.city,
    country: raw.country,
    phone: raw.phone,
    website: raw.website,
    notes: raw.notes,
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  };
}

export function mapInvitation(raw: any): TripInvitation {
  return {
    id: raw._id ?? raw.id,
    tripId: raw.tripId,
    inviterId: raw.inviterId,
    inviteeEmail: raw.inviteeEmail,
    inviteePhone: raw.inviteePhone,
    status: raw.status,
    token: raw.token,
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : new Date(),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    trip: raw.trip ?? null,
  };
}

export function mapInvitationWithExtras(raw: any): any {
  return {
    ...mapInvitation(raw),
    type: raw.type,
    permissions: raw.permissions,
    inviter: raw.inviter,
  };
}

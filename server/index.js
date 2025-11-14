// Simple Express API (JS) for Expo dev
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const os = require("os");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`[server] ${req.method} ${req.path}`);
  next();
});

const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "mytripcircle";

// IP depuis .env ou détection automatique
const ACTIVE_IP =
  process.env.API_IP_PRIMARY ||
  (() => {
    console.log(
      "[server] API_IP_PRIMARY not set, detecting IP automatically..."
    );
    const interfaces = os.networkInterfaces();
    const priorityInterfaces = ["Wi-Fi", "Ethernet", "en0", "eth0"];

    for (const interfaceName of priorityInterfaces) {
      if (interfaces[interfaceName]) {
        for (const iface of interfaces[interfaceName]) {
          if (iface.family === "IPv4" && !iface.internal) {
            return iface.address;
          }
        }
      }
    }

    // Fallback: première IP non-internale
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }

    return "localhost";
  })();

let db;

async function connectMongo() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[server] Connected to MongoDB: ${DB_NAME}`);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    trips: "Use /trips endpoint",
    bookings: "Use /bookings endpoint",
    addresses: "Use /addresses endpoint",
  });
});

app.get("/trips", async (_req, res) => {
  try {
    const items = await db.collection("trips").find({}).toArray();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/trips/:id", async (req, res) => {
  try {
    const item = await db
      .collection("trips")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Créer un nouveau voyage
app.post("/trips", async (req, res) => {
  try {
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      ownerId,
      isPublic,
      visibility,
      tags,
    } = req.body;

    console.log("=== CREATE TRIP DEBUG ===");
    console.log("Request body:", req.body);

    // Validation des champs requis
    if (!title || !destination || !startDate || !endDate || !ownerId) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Permettre la date du jour (enlever les heures/minutes/secondes pour la comparaison)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    if (start >= end) {
      console.log("End date must be after start date");
      return res
        .status(400)
        .json({ error: "End date must be after start date" });
    }

    if (startDateOnly < today) {
      console.log("Start date cannot be in the past");
      return res
        .status(400)
        .json({ error: "Start date cannot be in the past" });
    }

    // Déterminer la visibilité basée sur les paramètres reçus
    const tripVisibility = visibility || (isPublic ? "public" : "private");

    // Créer un voyage avec tous les champs requis selon le schéma MongoDB
    const trip = {
      title: title.trim(),
      description: description ? description.trim() : "",
      destination: destination.trim(),
      startDate: start,
      endDate: end,
      ownerId: ownerId, // Garder comme chaîne de caractères pour l'instant
      collaborators: [], // Initialiser avec un tableau vide
      isPublic: isPublic || false,
      visibility: tripVisibility, // Utiliser la visibilité fournie ou calculée
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        // Ajouter les stats requises
        totalBookings: 0,
        totalAddresses: 0,
        totalCollaborators: 0,
      },
      location: {
        // Ajouter la géolocalisation (coordonnées par défaut pour l'instant)
        type: "Point",
        coordinates: [0, 0], // Coordonnées par défaut jusqu'à géolocalisation
      },
      tags: tags || [], // Utiliser les tags fournis ou tableau vide
    };

    console.log("Trip object to insert:", JSON.stringify(trip, null, 2));

    const result = await db.collection("trips").insertOne(trip);
    console.log("Insert result:", result);

    trip._id = result.insertedId;
    console.log("Final trip with _id:", trip);

    res.status(201).json(trip);
  } catch (e) {
    console.error("Error creating trip:", e);
    console.error("Error message:", e.message);
    console.error("Error code:", e.code);
    console.error("Error details:", e);
    res.status(500).json({ error: e.message });
  }
});

// Modifier un voyage
app.put("/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      isPublic,
      userId,
    } = req.body;

    // Vérifier que le voyage existe
    const existingTrip = await db
      .collection("trips")
      .findOne({ _id: new ObjectId(id) });
    if (!existingTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Vérifier les permissions
    const isOwner = existingTrip.ownerId === userId;
    const isCollaborator = existingTrip.collaborators.some(
      (collab) => collab.userId === userId && collab.permissions.canEdit
    );

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this trip" });
    }

    // Validation des dates si fournies
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res
          .status(400)
          .json({ error: "End date must be after start date" });
      }
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (destination !== undefined) updateData.destination = destination.trim();
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const result = await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Récupérer le voyage mis à jour
    const updatedTrip = await db
      .collection("trips")
      .findOne({ _id: new ObjectId(id) });
    res.json(updatedTrip);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Supprimer un voyage
app.delete("/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Vérifier que le voyage existe
    const existingTrip = await db
      .collection("trips")
      .findOne({ _id: new ObjectId(id) });
    if (!existingTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Vérifier les permissions (seul le propriétaire peut supprimer)
    if (existingTrip.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Only the owner can delete this trip" });
    }

    // Supprimer le voyage et toutes ses données associées
    await Promise.all([
      db.collection("trips").deleteOne({ _id: new ObjectId(id) }),
      db.collection("bookings").deleteMany({ tripId: id }),
      db.collection("addresses").deleteMany({ tripId: id }),
      db.collection("invitations").deleteMany({ tripId: id }),
    ]);

    res.json({ success: true, message: "Trip deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Créer une nouvelle réservation (POST avant GET pour éviter les conflits)
app.post("/bookings", async (req, res) => {
  try {
    const {
      tripId,
      type,
      title,
      description,
      date,
      endDate,
      time,
      address,
      confirmationNumber,
      price,
      currency,
      status,
      attachments,
    } = req.body;

    console.log("=== CREATE BOOKING DEBUG ===");
    console.log("Request body:", req.body);

    // Validation des champs requis
    if (!type || !title || !date) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Créer la réservation
    const booking = {
      tripId: tripId || "",
      type,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      time: time || undefined,
      address: address ? address.trim() : undefined,
      confirmationNumber: confirmationNumber ? confirmationNumber.trim() : undefined,
      price: price ? parseFloat(price) : undefined,
      currency: currency || "EUR",
      status: status || "pending",
      attachments: attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Booking object to insert:", JSON.stringify(booking, null, 2));

    const result = await db.collection("bookings").insertOne(booking);
    console.log("Insert result:", result);

    booking._id = result.insertedId;
    console.log("Final booking with _id:", booking);

    res.status(201).json(booking);
  } catch (e) {
    console.error("Error creating booking:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/bookings", async (_req, res) => {
  try {
    const items = await db.collection("bookings").find({}).toArray();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/bookings/trip/:tripId", async (req, res) => {
  try {
    const items = await db
      .collection("bookings")
      .find({ tripId: req.params.tripId })
      .toArray();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/addresses", async (_req, res) => {
  try {
    const items = await db.collection("addresses").find({}).toArray();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/addresses/trip/:tripId", async (req, res) => {
  try {
    const items = await db
      .collection("addresses")
      .find({ tripId: req.params.tripId })
      .toArray();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== INVITATIONS ENDPOINTS =====

// Créer une invitation
app.post("/invitations", async (req, res) => {
  try {
    const { tripId, inviterId, inviteeEmail, message, permissions } = req.body;

    // Vérifier que le trip existe
    const trip = await db.collection("trips").findOne({ _id: tripId });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Vérifier que l'inviteur est propriétaire ou collaborateur avec permissions
    const isOwner = trip.ownerId === inviterId;
    const isCollaborator = trip.collaborators.some(
      (collab) => collab.userId === inviterId && collab.permissions.canInvite
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Not authorized to invite" });
    }

    // Vérifier que l'email n'est pas déjà collaborateur
    const existingCollaborator = trip.collaborators.find(
      (collab) =>
        collab.userId === inviteeEmail || collab.email === inviteeEmail
    );

    if (existingCollaborator) {
      return res.status(400).json({ error: "User is already a collaborator" });
    }

    // Vérifier qu'il n'y a pas d'invitation en attente
    const existingInvitation = await db.collection("invitations").findOne({
      tripId,
      inviteeEmail,
      status: "pending",
    });

    if (existingInvitation) {
      return res.status(400).json({ error: "Invitation already pending" });
    }

    // Générer un token unique
    const token = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const invitation = {
      tripId,
      inviterId,
      inviteeEmail,
      status: "pending",
      token,
      expiresAt,
      permissions: permissions || {
        role: "editor",
        canEdit: true,
        canInvite: false,
        canDelete: false,
      },
      message: message || "",
      createdAt: new Date(),
      respondedAt: null,
    };

    const result = await db.collection("invitations").insertOne(invitation);
    invitation._id = result.insertedId;

    res.status(201).json(invitation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Récupérer les invitations d'un utilisateur
app.get("/invitations/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { status } = req.query;

    let query = { inviteeEmail: email };
    if (status) {
      query.status = status;
    }

    const invitations = await db
      .collection("invitations")
      .find(query)
      .toArray();

    // Enrichir avec les données du trip
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const trip = await db
          .collection("trips")
          .findOne({ _id: invitation.tripId });
        const inviter = await db
          .collection("users")
          .findOne({ _id: invitation.inviterId });

        return {
          ...invitation,
          trip: trip
            ? {
                _id: trip._id,
                title: trip.title,
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
              }
            : null,
          inviter: inviter
            ? {
                _id: inviter._id,
                name: inviter.name,
                email: inviter.email,
                avatar: inviter.avatar,
              }
            : null,
        };
      })
    );

    res.json(enrichedInvitations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Accepter/Refuser une invitation
app.put("/invitations/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { action, userId } = req.body; // action: "accept" ou "decline"

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    // Trouver l'invitation
    const invitation = await db.collection("invitations").findOne({ token });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    // Vérifier que l'invitation n'a pas expiré
    if (new Date() > invitation.expiresAt) {
      await db
        .collection("invitations")
        .updateOne({ _id: invitation._id }, { $set: { status: "expired" } });
      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Vérifier que l'invitation est en attente
    if (invitation.status !== "pending") {
      return res.status(400).json({ error: "Invitation already processed" });
    }

    const newStatus = action === "accept" ? "accepted" : "declined";

    // Mettre à jour l'invitation
    await db.collection("invitations").updateOne(
      { _id: invitation._id },
      {
        $set: {
          status: newStatus,
          respondedAt: new Date(),
        },
      }
    );

    if (action === "accept") {
      // Ajouter l'utilisateur comme collaborateur
      const collaborator = {
        userId: userId || invitation.inviteeEmail, // Si pas d'userId, utiliser l'email
        role: invitation.permissions.role,
        joinedAt: new Date(),
        permissions: invitation.permissions,
      };

      await db
        .collection("trips")
        .updateOne(
          { _id: invitation.tripId },
          { $push: { collaborators: collaborator } }
        );
    }

    res.json({
      success: true,
      status: newStatus,
      message:
        action === "accept" ? "Invitation accepted" : "Invitation declined",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Récupérer les invitations envoyées par un utilisateur
app.get("/invitations/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = { inviterId: userId };
    if (status) {
      query.status = status;
    }

    const invitations = await db
      .collection("invitations")
      .find(query)
      .toArray();

    // Enrichir avec les données du trip
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const trip = await db
          .collection("trips")
          .findOne({ _id: invitation.tripId });

        return {
          ...invitation,
          trip: trip
            ? {
                _id: trip._id,
                title: trip.title,
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
              }
            : null,
        };
      })
    );

    res.json(enrichedInvitations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

connectMongo()
  .then(() => {
    // Log toutes les routes enregistrées pour debug
    console.log("[server] Routes registered:");
    console.log("  POST /bookings");
    console.log("  GET /bookings");
    console.log("  GET /bookings/trip/:tripId");
    
    app.listen(PORT, ACTIVE_IP, () => {
      console.log(`[server] API listening on http://${ACTIVE_IP}:${PORT}`);
      console.log(`[server] Accessible via http://localhost:${PORT}`);
      console.log(`[server] Use this IP in your app: ${ACTIVE_IP}`);
    });
  })
  .catch((err) => {
    console.error("[server] Mongo connection error:", err);
    process.exit(1);
  });

// Garder le processus actif
process.on("SIGINT", () => {
  console.log("\n[server] Shutting down gracefully...");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[server] Unhandled Rejection at:", promise, "reason:", reason);
});

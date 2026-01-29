// Simple Express API (JS) for Expo dev
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const os = require("os");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth + user routes backed by MongoDB (users collection)
const authRoutes = express.Router();

const userRoutes = express.Router();

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}

console.log("ENV CHECK:", {
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS ? "OK" : "MISSING",
});

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  return {
    id: String(userDoc._id),
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone,
    avatar: userDoc.avatar,
    verified: userDoc.verified || false,
    createdAt: userDoc.createdAt,
  };
}

function isStrongPassword(password) {
  if (typeof password !== "string") return false;
  // min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
    password,
  );
}

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = typeof decoded === "string" ? decoded : decoded.id;

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}

authRoutes.post("/register", async (req, res) => {
  try {
    const name = trimIfString(req.body?.name);
    const email = trimIfString(req.body?.email)?.toLowerCase();
    const password = req.body?.password;
    const phone = trimIfString(req.body?.phone);

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        error: "Weak password",
        field: "password",
      });
    }

    // Very permissive phone validation (E.164-ish)
    const phoneOk = /^[+]?[\d\s().-]{7,20}$/.test(phone);
    if (!phoneOk) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number",
        field: "phone",
      });
    }

    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Email already in use",
        field: "email",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const userDoc = {
      name,
      email,
      // Store the hash under `password` to satisfy MongoDB validators/schemas.
      password: passwordHash,
      phone,
      otp,
      otpExpiresAt,
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(userDoc);
    const userId = String(result.insertedId);

    // In production, send OTP via email/SMS here
    // For now, log it for testing
    console.log(`[REGISTER] OTP for ${email}: ${otp}`);

    return res.status(201).json({
      success: true,
      userId,
      message: "OTP sent to your email",
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

authRoutes.post("/login", async (req, res) => {
  try {
    const email = trimIfString(req.body?.email)?.toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        field: "password",
      });
    }

    const storedHash = user.passwordHash || user.password;
    if (!storedHash) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        field: "password",
      });
    }

    const ok = await bcrypt.compare(password, storedHash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        field: "password",
      });
    }

    const token = jwt.sign({ id: String(user._id) }, getJwtSecret(), {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

userRoutes.put("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const name = trimIfString(req.body?.name);
    const email = trimIfString(req.body?.email)?.toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Name and email are required",
      });
    }

    const existing = await db.collection("users").findOne({
      email,
      _id: { $ne: userId },
    });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: "Email already in use" });
    }

    await db
      .collection("users")
      .updateOne(
        { _id: userId },
        { $set: { name, email, updatedAt: new Date() } },
      );

    const updated = await db.collection("users").findOne({ _id: userId });
    return res.json({ success: true, user: sanitizeUser(updated) });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

userRoutes.put("/change-password", requireAuth, async (req, res) => {
  try {
    const currentPassword = req.body?.currentPassword;
    const newPassword = req.body?.newPassword;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const storedHash = req.user.passwordHash || req.user.password;
    if (!storedHash) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    const ok = await bcrypt.compare(currentPassword, storedHash);
    if (!ok) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: "Weak password",
        field: "password",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: req.user._id },
      {
        $set: { password: passwordHash, updatedAt: new Date() },
        $unset: { passwordHash: "" },
      },
    );

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Forgot password - request reset link
authRoutes.post("/forgot-password", async (req, res) => {
  try {
    const email = trimIfString(req.body?.email)?.toLowerCase();

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        success: true,
        message: "If an account exists, a reset link has been sent",
      });
    }

    // Generate reset token (simple implementation - in production use crypto.randomBytes)
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (in production, use a separate collection)
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        },
      },
    );

    // In production, send email here with reset link
    // For now, just return success (you can log the token for testing)
    console.log(`[FORGOT PASSWORD] Reset token for ${email}: ${resetToken}`);
    console.log(
      `[FORGOT PASSWORD] Reset link: /reset-password?token=${resetToken}`,
    );

    return res.json({
      success: true,
      message: "If an account exists, a reset link has been sent",
      // In dev only - remove in production
      devToken: resetToken,
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Reset password with token
authRoutes.post("/reset-password", async (req, res) => {
  try {
    const token = req.body?.token;
    const newPassword = req.body?.newPassword;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ success: false, error: "Token and new password are required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: "Weak password",
        field: "password",
      });
    }

    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: passwordHash,
          updatedAt: new Date(),
        },
        $unset: {
          resetToken: "",
          resetTokenExpiresAt: "",
          passwordHash: "",
        },
      },
    );

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Verify OTP
authRoutes.post("/verify-otp", async (req, res) => {
  try {
    const userId = req.body?.userId;
    const otp = req.body?.otp;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        error: "User ID and OTP are required",
      });
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if OTP exists and is valid
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    // Check if OTP has expired
    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
    }

    // Mark user as verified and clear OTP
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verified: true,
          updatedAt: new Date(),
        },
        $unset: {
          otp: "",
          otpExpiresAt: "",
        },
      },
    );

    // Generate JWT token
    const token = jwt.sign({ id: userId }, getJwtSecret(), {
      expiresIn: "7d",
    });

    // Get updated user
    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    return res.json({
      success: true,
      token,
      user: sanitizeUser(updatedUser),
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

app.use("/users", authRoutes);
// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`[server] ${req.method} ${req.path}`);
  next();
});

app.use("/users", userRoutes);

const PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 4000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "mytripcircle";

// IP depuis .env ou détection automatique
const ACTIVE_IP =
  process.env.API_IP_PRIMARY ||
  (() => {
    console.log(
      "[server] API_IP_PRIMARY not set, detecting IP automatically...",
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
const trimIfString = (value) =>
  typeof value === "string" ? value.trim() : value;

async function connectMongo() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`[server] Connected to MongoDB: ${DB_NAME}`);
  // Best effort: ensure unique emails
  try {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
  } catch (_) {
    // ignore
  }

  // Best effort: ensure `phone` is allowed by users collection validator (if any)
  try {
    const infos = await db
      .listCollections({ name: "users" }, { nameOnly: false })
      .toArray();
    const info = infos[0];
    const schema = info?.options?.validator?.$jsonSchema;

    if (schema?.properties && !schema.properties.phone) {
      const nextSchema = {
        ...schema,
        properties: {
          ...schema.properties,
          phone: { bsonType: "string" },
        },
      };

      await db.command({
        collMod: "users",
        validator: { $jsonSchema: nextSchema },
        validationLevel: info?.options?.validationLevel || "strict",
        validationAction: info?.options?.validationAction || "error",
      });

      console.log("[server] users validator updated (phone enabled)");
    }
  } catch (e) {
    console.log("[server] Could not update users validator:", e?.message || e);
  }
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
      start.getDate(),
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
      (collab) => collab.userId === userId && collab.permissions.canEdit,
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
      confirmationNumber: confirmationNumber
        ? confirmationNumber.trim()
        : undefined,
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

app.get("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db
      .collection("addresses")
      .findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ error: "Address not found" });
    }
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/addresses", async (req, res) => {
  try {
    const { type, name, address, city, country, phone, website, notes } =
      req.body;

    if (!type || !name || !address || !city || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const addressDoc = {
      type,
      name: trimIfString(name),
      address: trimIfString(address),
      city: trimIfString(city),
      country: trimIfString(country),
      phone: phone ? trimIfString(phone) : undefined,
      website: website ? trimIfString(website) : undefined,
      notes: notes ? trimIfString(notes) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("addresses").insertOne(addressDoc);
    addressDoc._id = result.insertedId;
    res.status(201).json(addressDoc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/addresses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db
      .collection("addresses")
      .findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return res.status(404).json({ error: "Address not found" });
    }

    const { type, name, address, city, country, phone, website, notes } =
      req.body;

    const setData = { updatedAt: new Date() };
    const unsetData = {};

    if (type !== undefined) setData.type = type;
    if (name !== undefined) setData.name = trimIfString(name);
    if (address !== undefined) setData.address = trimIfString(address);
    if (city !== undefined) setData.city = trimIfString(city);
    if (country !== undefined) setData.country = trimIfString(country);

    if (phone !== undefined) {
      if (phone) {
        setData.phone = trimIfString(phone);
      } else {
        unsetData.phone = "";
      }
    }
    if (website !== undefined) {
      if (website) {
        setData.website = trimIfString(website);
      } else {
        unsetData.website = "";
      }
    }
    if (notes !== undefined) {
      if (notes) {
        setData.notes = trimIfString(notes);
      } else {
        unsetData.notes = "";
      }
    }

    const updatePayload = {};
    if (Object.keys(setData).length > 0) {
      updatePayload.$set = setData;
    }
    if (Object.keys(unsetData).length > 0) {
      updatePayload.$unset = unsetData;
    }

    await db
      .collection("addresses")
      .updateOne({ _id: new ObjectId(id) }, updatePayload);

    const updated = await db
      .collection("addresses")
      .findOne({ _id: new ObjectId(id) });

    res.json(updated);
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
      (collab) => collab.userId === inviterId && collab.permissions.canInvite,
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "Not authorized to invite" });
    }

    // Vérifier que l'email n'est pas déjà collaborateur
    const existingCollaborator = trip.collaborators.find(
      (collab) =>
        collab.userId === inviteeEmail || collab.email === inviteeEmail,
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
      }),
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
      },
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
          { $push: { collaborators: collaborator } },
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
      }),
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

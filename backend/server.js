const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "smartpark-super-secret-key-9988";

// Security headers and compression
app.use(helmet({
  crossOriginResourcePolicy: false // Allows static uploads access from other origins
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Anti-DDoS Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { error: "Too many requests from this coordinates. Try again later." }
});
app.use(limiter);

// Strict CORS Origins Mapping
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.startsWith("http://localhost:") || origin.endsWith(".vercel.app");
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS parameters'));
    }
  },
  credentials: true
}));

// Track database connection state
let usePostgres = false;

// PostgreSQL connection pool with connection pooling options
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

// Test connection and build/migrate PostgreSQL tables
const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database successfully.");
    
    // Create/Verify Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150),
        password VARCHAR(255),
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'parker',
        wallet DECIMAL(10,2) DEFAULT 450.00,
        vehicles JSONB DEFAULT '[]'::jsonb
      );
    `);

    // Run schema migrations for existing tables
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet DECIMAL(10,2) DEFAULT 450.00;
    `);
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicles JSONB DEFAULT '[]'::jsonb;
    `);

    // Create/Verify Parkings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS parkings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150),
        location VARCHAR(255),
        price DECIMAL(10,2),
        phone VARCHAR(20),
        owner_id VARCHAR(100),
        rating DECIMAL(3,2) DEFAULT 0,
        total_ratings INTEGER DEFAULT 0,
        slots JSONB,
        pricing JSONB DEFAULT '{"Car": {"hourly": 50, "daily": 300}, "Bike": {"hourly": 20, "daily": 100}, "EV": {"hourly": 60, "daily": 400}, "Truck": {"hourly": 100, "daily": 700}}'::jsonb
      );
    `);

    // Run pricing migration
    await client.query(`
      ALTER TABLE parkings ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{"Car": {"hourly": 50, "daily": 300}, "Bike": {"hourly": 20, "daily": 100}, "EV": {"hourly": 60, "daily": 400}, "Truck": {"hourly": 100, "daily": 700}}'::jsonb;
    `);

    // Create/Verify Bookings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        parking_id VARCHAR(100),
        parking_name VARCHAR(150),
        location VARCHAR(255),
        vehicle_type VARCHAR(50),
        price DECIMAL(10,2),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Completed',
        entry_time TIMESTAMP DEFAULT NULL,
        exit_time TIMESTAMP DEFAULT NULL,
        verification_token VARCHAR(255) DEFAULT NULL,
        vehicle_no VARCHAR(50) DEFAULT NULL
      );
    `);

    // Run bookings migrations
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS entry_time TIMESTAMP DEFAULT NULL;
    `);
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS exit_time TIMESTAMP DEFAULT NULL;
    `);
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) DEFAULT NULL;
    `);
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_no VARCHAR(50) DEFAULT NULL;
    `);

    console.log("PostgreSQL schemas verified successfully.");
    usePostgres = true;
    client.release();
  } catch (err) {
    console.warn("PostgreSQL connection failed:", err.message);
    console.warn("FALLBACK: Launching server using local JSON database mock (db.json).");
    usePostgres = false;
  }
};

initDb();

// ==========================================
// LOCAL JSON DATABASE MOCK FALLBACK LAYER
// ==========================================
const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading db.json:", err);
  }
  return { users: [], parkings: [], bookings: [] };
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

function generateId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class DocumentInstance {
  constructor(collectionName, data) {
    Object.assign(this, data);
    Object.defineProperty(this, "_collectionName", { value: collectionName, enumerable: false });
  }

  async save() {
    const db = readDB();
    const collection = db[this._collectionName] || [];
    const index = collection.findIndex(item => item._id === this._id);
    const updatedData = { ...this };
    
    if (index >= 0) {
      collection[index] = updatedData;
    } else {
      collection.push(updatedData);
    }
    
    db[this._collectionName] = collection;
    writeDB(db);
    return this;
  }
}

class MockModel {
  constructor(name) {
    this.name = name;
    this.collectionName = name.toLowerCase() + "s";
  }

  async create(data) {
    const db = readDB();
    const collection = db[this.collectionName] || [];
    const newDoc = {
      _id: generateId(),
      wallet: 450.00,
      vehicles: [],
      ...data
    };
    if (this.name === "Parking" && !newDoc.pricing) {
      newDoc.pricing = {
        "Car": { "hourly": 50, "daily": 300 },
        "Bike": { "hourly": 20, "daily": 100 },
        "EV": { "hourly": 60, "daily": 400 },
        "Truck": { "hourly": 100, "daily": 700 }
      };
    }
    if (this.name === "Booking") {
      if (!newDoc.date) newDoc.date = new Date().toISOString();
      if (!newDoc.status) newDoc.status = "Completed";
      if (!newDoc.verification_token) {
        newDoc.verification_token = "TOKEN-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now();
      }
      if (!newDoc.entry_time) newDoc.entry_time = null;
      if (!newDoc.exit_time) newDoc.exit_time = null;
    }
    collection.push(newDoc);
    db[this.collectionName] = collection;
    writeDB(db);
    return new DocumentInstance(this.collectionName, newDoc);
  }

  find(query = {}) {
    const db = readDB();
    const collection = db[this.collectionName] || [];
    
    let results = collection.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }).map(item => new DocumentInstance(this.collectionName, clone(item)));

    const thenable = {
      then: (onFulfilled, onRejected) => {
        return Promise.resolve(results).then(onFulfilled, onRejected);
      },
      sort: (sortObj) => {
        const sortKey = Object.keys(sortObj)[0];
        const sortOrder = sortObj[sortKey];
        const sortedResults = results.slice().sort((a, b) => {
          const valA = a[sortKey];
          const valB = b[sortKey];
          if (valA < valB) return sortOrder === -1 ? 1 : -1;
          if (valA > valB) return sortOrder === -1 ? -1 : 1;
          return 0;
        });
        return Promise.resolve(sortedResults);
      }
    };
    return thenable;
  }

  async findOne(query) {
    const db = readDB();
    const collection = db[this.collectionName] || [];
    const match = collection.find(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    return match ? new DocumentInstance(this.collectionName, clone(match)) : null;
  }

  async findById(id) {
    const db = readDB();
    const collection = db[this.collectionName] || [];
    const match = collection.find(item => item._id === id);
    return match ? new DocumentInstance(this.collectionName, clone(match)) : null;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const db = readDB();
    const collection = db[this.collectionName] || [];
    const index = collection.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    collection[index] = {
      ...collection[index],
      ...updateData
    };
    db[this.collectionName] = collection;
    writeDB(db);
    return new DocumentInstance(this.collectionName, clone(collection[index]));
  }

  async findByIdAndDelete(id) {
    const db = readDB();
    const collection = db[this.collectionName] || [];
    const index = collection.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    const deleted = collection.splice(index, 1)[0];
    db[this.collectionName] = collection;
    writeDB(db);
    return new DocumentInstance(this.collectionName, clone(deleted));
  }
}

const UserMock = new MockModel("User");
const ParkingMock = new MockModel("Parking");
const BookingMock = new MockModel("Booking");


// ==========================================
// POSTGRESQL DATA MAPPERS
// ==========================================
function formatUser(row) {
  if (!row) return null;
  return {
    _id: row.id.toString(),
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    wallet: Number(row.wallet || 0),
    vehicles: typeof row.vehicles === 'string' ? JSON.parse(row.vehicles) : (row.vehicles || [])
  };
}

function formatParking(row) {
  if (!row) return null;
  return {
    _id: row.id.toString(),
    title: row.title,
    location: row.location,
    price: Number(row.price),
    phone: row.phone,
    ownerId: row.owner_id,
    rating: Number(row.rating || 0),
    totalRatings: Number(row.total_ratings || 0),
    slots: typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots,
    pricing: typeof row.pricing === 'string' ? JSON.parse(row.pricing) : (row.pricing || {
      "Car": { "hourly": 50, "daily": 300 },
      "Bike": { "hourly": 20, "daily": 100 },
      "EV": { "hourly": 60, "daily": 400 },
      "Truck": { "hourly": 100, "daily": 700 }
    })
  };
}

function formatBooking(row) {
  if (!row) return null;
  return {
    _id: row.id.toString(),
    userId: row.user_id,
    parkingId: row.parking_id,
    parkingName: row.parking_name,
    location: row.location,
    vehicleType: row.vehicle_type,
    price: Number(row.price),
    date: row.date,
    status: row.status,
    entryTime: row.entry_time,
    exitTime: row.exit_time,
    verificationToken: row.verification_token,
    vehicleNo: row.vehicle_no
  };
}


// ==========================================
// UPLOADS & FILE SYSTEM SETUPS
// ==========================================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const cleanName = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, cleanName);
  }
});

// File MIME Filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file extension. Only PNG, JPG, JPEG, and MP4 media are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB general buffer (specific types audited in route)
  }
}).single("file");

app.use("/uploads", express.static(uploadDir));


// ==========================================
// API ROUTES
// ==========================================

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    database: usePostgres ? "PostgreSQL" : "Local JSON Fallback Mock",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => {
  res.send(`Smart Parking API Running (Engine: ${usePostgres ? 'PostgreSQL' : 'JSON Mock Fallback'})`);
});

// Auth Routes
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const userRole = role || 'parker';

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Missing required profile parameters." });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (usePostgres) {
      const existingRes = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role = $2",
        [email, userRole]
      );
      if (existingRes.rows.length > 0) {
        return res.status(400).json({ error: "User already exists with this role" });
      }
      const insertRes = await pool.query(
        "INSERT INTO users (name, email, password, phone, role, wallet, vehicles) VALUES ($1, $2, $3, $4, $5, 450.00, '[]'::jsonb) RETURNING *",
        [name, email, hashedPassword, phone, userRole]
      );
      
      const user = formatUser(insertRes.rows[0]);
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, ...user });
    } else {
      const existing = await UserMock.findOne({ email, role: userRole });
      if (existing) {
        return res.status(400).json({ error: "User already exists with this role" });
      }
      const user = await UserMock.create({ name, email, password: hashedPassword, phone, role: userRole, wallet: 450.00, vehicles: [] });
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, ...user });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const userRole = role || 'parker';
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    if (usePostgres) {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role = $2",
        [email, userRole]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const row = result.rows[0];
      
      // Compare password hashes
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, row.password);
      } catch (e) {}

      // Fallback for pre-existing unhashed credentials
      if (!isMatch && password === row.password) {
        isMatch = true;
        const newHash = await bcrypt.hash(password, 10);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [newHash, row.id]);
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = formatUser(row);
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, ...user });
    } else {
      const user = await UserMock.findOne({ email, role: userRole });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {}

      if (!isMatch && password === user.password) {
        isMatch = true;
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, ...user });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile endpoint (Wallet recharge & Vehicles additions)
app.post("/user/update", async (req, res) => {
  try {
    const { userId, name, phone, wallet, vehicles } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    if (usePostgres) {
      const uid = parseInt(userId);
      const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [uid]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: "User profile not found" });
      }

      const current = userCheck.rows[0];
      const newName = name !== undefined ? name : current.name;
      const newPhone = phone !== undefined ? phone : current.phone;
      const newWallet = wallet !== undefined ? Number(wallet) : Number(current.wallet);
      
      let newVehicles = current.vehicles;
      if (vehicles !== undefined) {
        newVehicles = typeof vehicles === 'string' ? JSON.parse(vehicles) : vehicles;
      }
      const vehiclesJson = JSON.stringify(newVehicles || []);

      const result = await pool.query(
        "UPDATE users SET name = $1, phone = $2, wallet = $3, vehicles = $4 WHERE id = $5 RETURNING *",
        [newName, newPhone, newWallet, vehiclesJson, uid]
      );
      res.json(formatUser(result.rows[0]));
    } else {
      const user = await UserMock.findById(userId);
      if (!user) return res.status(404).json({ error: "User profile not found" });
      user.name = name !== undefined ? name : user.name;
      user.phone = phone !== undefined ? phone : user.phone;
      user.wallet = wallet !== undefined ? wallet : user.wallet;
      user.vehicles = vehicles !== undefined ? vehicles : user.vehicles;
      await user.save();
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Media Upload endpoint
app.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error limits: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please select a media file to upload." });
    }

    const isImage = req.file.mimetype.startsWith("image/");
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;

    if (req.file.size > maxSize) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
      return res.status(400).json({ 
        error: `File size exceeded limits. Max size: ${isImage ? '10MB for images' : '100MB for videos'}.` 
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({
      message: "Media uploaded successfully",
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
    });
  });
});

// Parking Routes
app.get("/all", async (req, res) => {
  try {
    if (usePostgres) {
      const result = await pool.query("SELECT * FROM parkings");
      res.json(result.rows.map(formatParking));
    } else {
      const data = await ParkingMock.find();
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/owner/:ownerId", async (req, res) => {
  try {
    if (usePostgres) {
      const result = await pool.query(
        "SELECT * FROM parkings WHERE owner_id = $1", 
        [req.params.ownerId.toString()]
      );
      res.json(result.rows.map(formatParking));
    } else {
      const data = await ParkingMock.find({ ownerId: req.params.ownerId });
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add", async (req, res) => {
  try {
    const { title, location, price, phone, ownerId, slots, pricing } = req.body;
    const slotsJson = JSON.stringify(slots || []);
    
    // Default pricing if none provided
    const defaultPricing = pricing || {
      "Car": { "hourly": Number(price) || 50, "daily": (Number(price) || 50) * 6 },
      "Bike": { "hourly": (Number(price) || 50) * 0.4, "daily": (Number(price) || 50) * 2.4 },
      "EV": { "hourly": (Number(price) || 50) * 1.2, "daily": (Number(price) || 50) * 7.2 },
      "Truck": { "hourly": (Number(price) || 50) * 2.0, "daily": (Number(price) || 50) * 12.0 }
    };
    const pricingJson = JSON.stringify(defaultPricing);

    if (usePostgres) {
      const result = await pool.query(
        "INSERT INTO parkings (title, location, price, phone, owner_id, slots, pricing) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [title, location, price, phone, ownerId ? ownerId.toString() : null, slotsJson, pricingJson]
      );
      res.json(formatParking(result.rows[0]));
    } else {
      const data = await ParkingMock.create({ title, location, price, phone, ownerId, slots, pricing: defaultPricing });
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const { title, location, price, phone, ownerId, slots, pricing } = req.body;
    
    if (usePostgres) {
      const parkingId = parseInt(req.params.id);
      const existing = await pool.query("SELECT * FROM parkings WHERE id = $1", [parkingId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Parking spot not found" });
      }

      const current = existing.rows[0];
      const newTitle = title !== undefined ? title : current.title;
      const newLocation = location !== undefined ? location : current.location;
      const newPrice = price !== undefined ? price : current.price;
      const newPhone = phone !== undefined ? phone : current.phone;
      const newOwnerId = ownerId !== undefined ? ownerId.toString() : current.owner_id;
      
      let newSlots = current.slots;
      if (slots !== undefined) {
        newSlots = typeof slots === 'string' ? JSON.parse(slots) : slots;
      }
      const slotsJson = JSON.stringify(newSlots);

      let newPricing = current.pricing;
      if (pricing !== undefined) {
        newPricing = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
      }
      const pricingJson = JSON.stringify(newPricing);

      const result = await pool.query(
        "UPDATE parkings SET title = $1, location = $2, price = $3, phone = $4, owner_id = $5, slots = $6, pricing = $7 WHERE id = $8 RETURNING *",
        [newTitle, newLocation, newPrice, newPhone, newOwnerId, slotsJson, pricingJson, parkingId]
      );
      res.json(formatParking(result.rows[0]));
    } else {
      const updated = await ParkingMock.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    if (usePostgres) {
      const parkingId = parseInt(req.params.id);
      const result = await pool.query("DELETE FROM parkings WHERE id = $1 RETURNING *", [parkingId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Parking spot not found" });
      }
      res.json({ message: "Deleted" });
    } else {
      await ParkingMock.findByIdAndDelete(req.params.id);
      res.json({ message: "Deleted" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/book", async (req, res) => {
  try {
    const { parkingId, vehicleType, userId, vehicleNo, price } = req.body;
    
    if (usePostgres) {
      const pid = parseInt(parkingId);
      const parkingRes = await pool.query("SELECT * FROM parkings WHERE id = $1", [pid]);
      if (parkingRes.rows.length === 0) {
        return res.status(404).json({ error: "Parking spot not found" });
      }

      const parking = parkingRes.rows[0];
      let slots = typeof parking.slots === 'string' ? JSON.parse(parking.slots) : parking.slots;
      if (!Array.isArray(slots)) slots = [];

      // Case-Insensitive slot checks
      const slotData = slots.find(s => s.type.toLowerCase() === vehicleType.toLowerCase());
      if (!slotData || slotData.available <= 0) {
        return res.status(400).json({ error: `No ${vehicleType} slots available.` });
      }

      const costToDeduct = price !== undefined ? Number(price) : Number(parking.price);

      // Wallet verification check
      if (userId) {
        const uRes = await pool.query("SELECT * FROM users WHERE id = $1", [parseInt(userId)]);
        if (uRes.rows.length > 0) {
          const user = uRes.rows[0];
          if (Number(user.wallet) < costToDeduct) {
            return res.status(400).json({ error: "Insufficient wallet balance." });
          }
          const newWallet = Math.max(0, Number(user.wallet || 0) - costToDeduct);
          await pool.query("UPDATE users SET wallet = $1 WHERE id = $2", [newWallet, user.id]);
        }
      }

      slotData.available -= 1;
      const slotsJson = JSON.stringify(slots);

      await pool.query("UPDATE parkings SET slots = $1 WHERE id = $2", [slotsJson, pid]);

      const verificationToken = "TOKEN-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now();

      let newBooking = null;
      if (userId) {
        const bRes = await pool.query(
          "INSERT INTO bookings (user_id, parking_id, parking_name, location, vehicle_type, price, status, verification_token, vehicle_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
          [
            userId.toString(),
            parkingId.toString(),
            parking.title,
            parking.location,
            vehicleType,
            costToDeduct,
            "Completed",
            verificationToken,
            vehicleNo || "DL-3C-AM-1234"
          ]
        );
        newBooking = formatBooking(bRes.rows[0]);
      }

      res.json(newBooking || formatParking(parking));
    } else {
      const parking = await ParkingMock.findById(parkingId);
      if (!parking) return res.status(404).json({ error: "Not found" });

      const slotData = parking.slots.find(s => s.type.toLowerCase() === vehicleType.toLowerCase());
      if (!slotData || slotData.available <= 0) {
        return res.status(400).json({ error: `No ${vehicleType} slots available.` });
      }

      const costToDeduct = price !== undefined ? Number(price) : Number(parking.price);

      if (userId) {
        const user = await UserMock.findById(userId);
        if (user) {
          if (Number(user.wallet) < costToDeduct) {
            return res.status(400).json({ error: "Insufficient wallet balance." });
          }
          user.wallet = Math.max(0, Number(user.wallet || 0) - costToDeduct);
          await user.save();
        }
      }

      slotData.available -= 1;
      await parking.save();

      const verificationToken = "TOKEN-" + Math.floor(100000 + Math.random() * 900000) + "-" + Date.now();

      let newBooking = null;
      if (userId) {
        newBooking = await BookingMock.create({
          userId,
          parkingId,
          parkingName: parking.title,
          location: parking.location,
          vehicleType,
          price: costToDeduct,
          status: "Completed",
          verification_token: verificationToken,
          vehicle_no: vehicleNo || "DL-3C-AM-1234"
        });
      }

      res.json(newBooking || parking);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// QR Scanner Verification Endpoint
app.post("/verify/scan", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Missing verification token or booking ID" });

    if (usePostgres) {
      let result = await pool.query(
        "SELECT * FROM bookings WHERE verification_token = $1 OR id::text = $2",
        [token, token]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "❌ Invalid QR Code / Ticket not found." });
      }

      const booking = result.rows[0];
      
      // Entry scan
      if (booking.status === 'Completed' && !booking.entry_time) {
        const now = new Date();
        await pool.query(
          "UPDATE bookings SET status = $1, entry_time = $2 WHERE id = $3",
          ['Checked-In', now, booking.id]
        );
        
        let userName = "Parker";
        const uRes = await pool.query("SELECT name FROM users WHERE id = $1", [parseInt(booking.user_id)]);
        if (uRes.rows.length > 0) userName = uRes.rows[0].name;

        return res.json({
          message: "✅ Entry Approved",
          action: "entry",
          booking: {
            ...formatBooking(booking),
            status: 'Checked-In',
            entryTime: now,
            userName,
            vehicleNo: booking.vehicle_no,
            vehicleType: booking.vehicle_type
          }
        });
      }

      // Exit scan
      if (booking.status === 'Checked-In') {
        const now = new Date();
        await pool.query(
          "UPDATE bookings SET status = $1, exit_time = $2 WHERE id = $3",
          ['Completed', now, booking.id]
        );

        // Reclaim slot back to vehicle capacity
        const pid = parseInt(booking.parking_id);
        const parkingRes = await pool.query("SELECT * FROM parkings WHERE id = $1", [pid]);
        if (parkingRes.rows.length > 0) {
          const parking = parkingRes.rows[0];
          let slots = typeof parking.slots === 'string' ? JSON.parse(parking.slots) : parking.slots;
          if (Array.isArray(slots)) {
            const slotData = slots.find(s => s.type.toLowerCase() === booking.vehicle_type.toLowerCase());
            if (slotData) {
              slotData.available = Math.min(slotData.total, slotData.available + 1);
              await pool.query("UPDATE parkings SET slots = $1 WHERE id = $2", [JSON.stringify(slots), pid]);
            }
          }
        }

        let userName = "Parker";
        const uRes = await pool.query("SELECT name FROM users WHERE id = $1", [parseInt(booking.user_id)]);
        if (uRes.rows.length > 0) userName = uRes.rows[0].name;

        return res.json({
          message: "✅ Exit Approved",
          action: "exit",
          booking: {
            ...formatBooking(booking),
            status: 'Completed',
            exitTime: now,
            userName,
            vehicleNo: booking.vehicle_no,
            vehicleType: booking.vehicle_type
          }
        });
      }

      if (booking.status === 'Completed' && booking.exit_time) {
        return res.status(400).json({ error: "❌ Booking Already Used (Exit Complete)." });
      }

      return res.status(400).json({ error: "❌ Booking Expired or Invalid." });

    } else {
      // Mock db verification
      const db = readDB();
      const booking = db.bookings?.find(b => b.verification_token === token || b._id === token);
      if (!booking) {
        return res.status(404).json({ error: "❌ Invalid QR Code / Ticket not found." });
      }

      if (booking.status === 'Completed' && !booking.entry_time) {
        booking.status = 'Checked-In';
        booking.entry_time = new Date().toISOString();
        writeDB(db);

        const user = db.users?.find(u => u._id === booking.userId);
        const userName = user ? user.name : "Parker";

        return res.json({
          message: "✅ Entry Approved",
          action: "entry",
          booking: {
            ...booking,
            userName,
            vehicleNo: booking.vehicle_no || "Unknown",
            vehicleType: booking.vehicleType
          }
        });
      }

      if (booking.status === 'Checked-In') {
        booking.status = 'Completed';
        booking.exit_time = new Date().toISOString();
        
        // Reclaim slot
        const parking = db.parkings?.find(p => p._id === booking.parkingId);
        if (parking && Array.isArray(parking.slots)) {
          const slotData = parking.slots.find(s => s.type.toLowerCase() === booking.vehicleType.toLowerCase());
          if (slotData) {
            slotData.available = Math.min(slotData.total, slotData.available + 1);
          }
        }
        writeDB(db);

        const user = db.users?.find(u => u._id === booking.userId);
        const userName = user ? user.name : "Parker";

        return res.json({
          message: "✅ Exit Approved",
          action: "exit",
          booking: {
            ...booking,
            userName,
            vehicleNo: booking.vehicle_no || "Unknown",
            vehicleType: booking.vehicleType
          }
        });
      }

      if (booking.status === 'Completed' && booking.exit_time) {
        return res.status(400).json({ error: "❌ Booking Already Used (Exit Complete)." });
      }

      return res.status(400).json({ error: "❌ Booking Expired or Invalid." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/history/:userId", async (req, res) => {
  try {
    if (usePostgres) {
      const result = await pool.query(
        "SELECT * FROM bookings WHERE user_id = $1 ORDER BY date DESC",
        [req.params.userId.toString()]
      );
      res.json(result.rows.map(formatBooking));
    } else {
      const data = await BookingMock.find({ userId: req.params.userId }).sort({ date: -1 });
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/rate/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (usePostgres) {
      const pid = parseInt(req.params.id);
      const parkingRes = await pool.query("SELECT * FROM parkings WHERE id = $1", [pid]);
      if (parkingRes.rows.length === 0) {
        return res.status(404).json({ error: "Parking spot not found" });
      }

      const parking = parkingRes.rows[0];
      const totalRatings = parking.total_ratings || 0;
      const currentRating = parseFloat(parking.rating) || 0;
      
      const newRating = ((currentRating * totalRatings) + parseFloat(rating)) / (totalRatings + 1);
      const newTotal = totalRatings + 1;

      const updatedRes = await pool.query(
        "UPDATE parkings SET rating = $1, total_ratings = $2 WHERE id = $3 RETURNING *",
        [newRating, newTotal, pid]
      );

      res.json(formatParking(updatedRes.rows[0]));
    } else {
      const parking = await ParkingMock.findById(req.params.id);
      if (!parking) return res.status(404).json({ error: "Not found" });

      const totalRatings = parking.totalRatings || 0;
      const currentRating = parking.rating || 0;
      parking.rating = ((currentRating * totalRatings) + rating) / (totalRatings + 1);
      parking.totalRatings = totalRatings + 1;

      await parking.save();
      res.json(parking);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listeners
app.listen(PORT, () => console.log(`Server started on port ${PORT} (Hybrid PostgreSQL/Mock engine)`));

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Gracefully shutting down backend server...`);
  try {
    await pool.end();
    console.log("Database connection pool closed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error closing database connection pool:", err.message);
    process.exit(1);
  }
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
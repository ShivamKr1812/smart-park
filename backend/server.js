const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// Track whether we are running on PostgreSQL or falling back to the local JSON mock
let usePostgres = false;

// PostgreSQL Connection Pooling Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres",
  connectionTimeoutMillis: 3000 // Short timeout to fail fast and trigger fallback
});

// Test connection and execute initial database/table setups
const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL database successfully.");
    
    // Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150),
        password VARCHAR(100),
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'parker'
      );
    `);

    // Create Parkings Table
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
        slots JSONB
      );
    `);

    // Create Bookings Table
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
        status VARCHAR(50) DEFAULT 'Completed'
      );
    `);

    console.log("PostgreSQL schema initialized successfully.");
    usePostgres = true;
    client.release();
  } catch (err) {
    console.warn("PostgreSQL connection failed:", err.message);
    console.warn("FALLBACK: Launching server using local JSON database mock (db.json).");
    usePostgres = false;
  }
};

// Execute schema builder
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
      ...data
    };
    if (this.name === "Booking" && !newDoc.date) {
      newDoc.date = new Date().toISOString();
    }
    if (this.name === "Booking" && !newDoc.status) {
      newDoc.status = "Completed";
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
    password: row.password,
    phone: row.phone,
    role: row.role
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
    slots: typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots
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
    status: row.status
  };
}


// ==========================================
// API ROUTES
// ==========================================
app.get("/", (req, res) => {
  res.send(`Parking App Server Running (Mode: ${usePostgres ? 'PostgreSQL' : 'Local JSON Fallback'})`);
});

// Auth Routes
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const userRole = role || 'parker';
    
    if (usePostgres) {
      const existingRes = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role = $2",
        [email, userRole]
      );
      if (existingRes.rows.length > 0) {
        return res.status(400).json({ error: "User already exists with this role" });
      }
      const insertRes = await pool.query(
        "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, email, password, phone, userRole]
      );
      res.json(formatUser(insertRes.rows[0]));
    } else {
      const existing = await UserMock.findOne({ email, role: userRole });
      if (existing) {
        return res.status(400).json({ error: "User already exists with this role" });
      }
      const user = await UserMock.create({ name, email, password, phone, role: userRole });
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const userRole = role || 'parker';
    
    if (usePostgres) {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND password = $2 AND role = $3",
        [email, password, userRole]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json(formatUser(result.rows[0]));
    } else {
      const user = await UserMock.findOne({ email, password, role: userRole });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    if (usePostgres) {
      const { title, location, price, phone, ownerId, slots } = req.body;
      const slotsJson = JSON.stringify(slots || []);
      const result = await pool.query(
        "INSERT INTO parkings (title, location, price, phone, owner_id, slots) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title, location, price, phone, ownerId ? ownerId.toString() : null, slotsJson]
      );
      res.json(formatParking(result.rows[0]));
    } else {
      const data = await ParkingMock.create(req.body);
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const { title, location, price, phone, ownerId, slots } = req.body;
    
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

      const result = await pool.query(
        "UPDATE parkings SET title = $1, location = $2, price = $3, phone = $4, owner_id = $5, slots = $6 WHERE id = $7 RETURNING *",
        [newTitle, newLocation, newPrice, newPhone, newOwnerId, slotsJson, parkingId]
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
    const { parkingId, vehicleType, userId } = req.body;
    
    if (usePostgres) {
      const pid = parseInt(parkingId);
      const parkingRes = await pool.query("SELECT * FROM parkings WHERE id = $1", [pid]);
      if (parkingRes.rows.length === 0) {
        return res.status(404).json({ error: "Parking spot not found" });
      }

      const parking = parkingRes.rows[0];
      let slots = typeof parking.slots === 'string' ? JSON.parse(parking.slots) : parking.slots;
      if (!Array.isArray(slots)) slots = [];

      const slotData = slots.find(s => s.type === vehicleType);
      if (!slotData || slotData.available <= 0) {
        return res.status(400).json({ error: "No slots available for this vehicle type" });
      }

      slotData.available -= 1;
      const slotsJson = JSON.stringify(slots);

      const updatedRes = await pool.query(
        "UPDATE parkings SET slots = $1 WHERE id = $2 RETURNING *",
        [slotsJson, pid]
      );

      if (userId) {
        await pool.query(
          "INSERT INTO bookings (user_id, parking_id, parking_name, location, vehicle_type, price, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            userId.toString(),
            parkingId.toString(),
            parking.title,
            parking.location,
            vehicleType,
            parking.price,
            "Completed"
          ]
        );
      }

      res.json(formatParking(updatedRes.rows[0]));
    } else {
      const parking = await ParkingMock.findById(parkingId);
      if (!parking) return res.status(404).json({ error: "Not found" });

      const slotData = parking.slots.find(s => s.type === vehicleType);
      if (!slotData || slotData.available <= 0) {
        return res.status(400).json({ error: "No slots available for this vehicle" });
      }

      slotData.available -= 1;
      await parking.save();

      if (userId) {
        await BookingMock.create({
          userId,
          parkingId,
          parkingName: parking.title,
          location: parking.location,
          vehicleType,
          price: parking.price,
          status: "Completed"
        });
      }

      res.json(parking);
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

app.listen(5000, () => console.log("Server started on port 5000 (Hybrid PostgreSQL/Mock engine)"));
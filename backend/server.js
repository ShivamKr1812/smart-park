const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// LOCAL JSON DATABASE MOCK
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

const mongoose = {
  connect: async () => {
    console.log("Mock MongoDB initialized successfully (using local db.json)");
    return true;
  },
  model: (name) => {
    return new MockModel(name);
  }
};

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// MODELS
const Parking = mongoose.model("Parking", {
  title: String,
  location: String,
  price: Number,
  phone: String,
  ownerId: String,
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  slots: [{
    type: { type: String }, // e.g. "Car", "Bike"
    available: Number,
    total: Number
  }]
});

const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['user', 'owner', 'parker'], default: 'parker' }
});

const Booking = mongoose.model("Booking", {
  userId: String,
  parkingId: String,
  parkingName: String,
  location: String,
  vehicleType: String,
  price: Number,
  date: { type: Date, default: Date.now },
  status: { type: String, default: "Completed" }
});


// ROUTES
app.get("/", (req, res) => {
  res.send("Server running");
});

// Auth Routes
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = await User.findOne({ email, role: role || 'parker' });
    if (existing) {
      return res.status(400).json({ error: "User already exists with this role" });
    }
    const user = await User.create({ name, email, password, phone, role: role || 'parker' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, password, role: role || 'parker' });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Parking Routes
app.get("/all", async (req, res) => {
  try {
    const data = await Parking.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/owner/:ownerId", async (req, res) => {
  try {
    const data = await Parking.find({ ownerId: req.params.ownerId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add", async (req, res) => {
  try {
    const data = await Parking.create(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const updated = await Parking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await Parking.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/book", async (req, res) => {
  try {
    const { parkingId, vehicleType, userId } = req.body;
    const parking = await Parking.findById(parkingId);
    if (!parking) return res.status(404).json({ error: "Not found" });

    const slotData = parking.slots.find(s => s.type === vehicleType);
    if (!slotData || slotData.available <= 0) {
      return res.status(400).json({ error: "No slots available for this vehicle" });
    }

    slotData.available -= 1;
    await parking.save();

    if (userId) {
      await Booking.create({
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/history/:userId", async (req, res) => {
  try {
    const data = await Booking.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/rate/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    const parking = await Parking.findById(req.params.id);
    if (!parking) return res.status(404).json({ error: "Not found" });

    const totalRatings = parking.totalRatings || 0;
    const currentRating = parking.rating || 0;
    parking.rating = ((currentRating * totalRatings) + rating) / (totalRatings + 1);
    parking.totalRatings = totalRatings + 1;

    await parking.save();
    res.json(parking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server started on port 5000"));
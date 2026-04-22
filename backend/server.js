const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = await User.create({ name, email, password, phone, role: role || 'user' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
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
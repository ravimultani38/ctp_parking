const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const Location = require("./models/Location");
const User = require("./models/User");
const app = express();
const port = process.env.PORT || 3000;
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Frontend URL
    methods: ["GET", "POST"],
  },
});

if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendPath));

    // All unknown routes should be handed to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
}
const connectedUsers = {};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Register the user ID when emitted from the frontend
  socket.on("registerUser", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, socketId] of Object.entries(connectedUsers)) {
      if (socketId === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Use CORS and JSON parsing
app.use(cors());
app.use(express.json());

// JWT Middleware to verify token
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error();
    }
    req.user = user; // Attach user data
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
};

// POST: User Registration
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const newUser = new User({ username, email, password }); // Raw password is fine
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// POST: User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// GET: Fetch Locations (Secure Route)
app.get("/locations", authenticateJWT, async (req, res) => {
  try {
    const locations = await Location.find().sort("-createdAt").limit(10);
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      error: "Error fetching locations.",
      message: error.message,
    });
  }
});

// POST: Offer a Parking Spot
app.post("/locations/offer", authenticateJWT, async (req, res) => {
  try {
    const { latitude, longitude, tokensOffered } = req.body;

    if (!latitude || !longitude || tokensOffered == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newLocation = new Location({
      latitude,
      longitude,
      isAvailable: true,
      offeredBy: req.user.id,
      tokensOffered,
    });

    await newLocation.save();
    res.status(201).json({ message: "Parking spot offered successfully", location: newLocation });
  } catch (error) {
    console.error("Error offering parking spot:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// POST: Claim a Parking Spot
app.post("/locations/claim", authenticateJWT, async (req, res) => {
  try {
    const { locationId } = req.body;

    if (!locationId) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    const location = await Location.findById(locationId);
    if (!location || !location.isAvailable) {
      return res.status(404).json({ error: "Parking spot not available" });
    }

    const claimer = await User.findById(req.user.id);
    const offerer = await User.findById(location.offeredBy);

    if (!claimer || !offerer) {
      return res.status(404).json({ error: "Users not found" });
    }

    if (location.offeredBy.toString() === req.user.id) {
      return res
        .status(403)
        .json({ error: "You cannot claim a spot you previously offered" });
    }

    if (claimer.tokens < location.tokensOffered) {
      return res.status(400).json({ error: "Not enough tokens to claim this spot" });
    }

    // Transfer tokens
    claimer.tokens -= location.tokensOffered;
    offerer.tokens += location.tokensOffered;

    // Update location
    location.isAvailable = false;
    location.claimedBy = req.user.id;

    await claimer.save();
    await offerer.save();
    await location.save();

    // Emit notification to the offering user
    const offererSocketId = connectedUsers[offerer._id];
    if (offererSocketId) {
      io.to(offererSocketId).emit("parkingClaimed", {
        message: `Your parking spot has been claimed by ${claimer.username}.`,
        claimerUsername: claimer.username,
        locationId,
      });
    }

    res.status(200).json({ message: "Parking spot claimed successfully", location });
  } catch (error) {
    console.error("Error claiming parking spot:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});
app.get("/user/username/:id", authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send back the username
    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// GET: Get Available Parking Spots
app.get("/locations/available", authenticateJWT, async (req, res) => {
  try {
    const locations = await Location.find({ isAvailable: true });
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching available locations:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
// GET: Fetch Total Tokens (Secure Route)
app.get("/user/tokens", authenticateJWT, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      res.status(200).json({ tokens: user.tokens });
    } catch (error) {
      console.error("Error fetching tokens:", error);
      res.status(500).json({ error: "Server error", message: error.message });
    }
  });
  // PUT: Change Password
  app.put("/user/change-password", authenticateJWT, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required" });
    }
  
    try {
      const user = await User.findById(req.user.id);
      const isPasswordValid = await user.comparePassword(oldPassword);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Old password is incorrect" });
      }
  
      user.password = newPassword; // Mongoose will hash this automatically via pre-save hook
      await user.save();
  
      res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Error changing password:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // GET: User Info
  app.get("/user/info", authenticateJWT, async (req, res) => {
    try {
      const user = await User.findById(req.user.id, "username tokens");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  });

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

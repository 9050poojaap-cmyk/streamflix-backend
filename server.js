const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Movie Schema =====
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String, required: true },
  trailer: { type: String, required: true },
});

const Movie = mongoose.model("Movie", movieSchema);

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

const User = mongoose.model("User", userSchema);

// ===== Routes =====

// Root
app.get("/", (req, res) => {
  res.send("StreamFlix backend is running");
});

// Get all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get movie by ID
app.get("/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: "Invalid movie ID" });
  }
});

// Add movie
app.post("/movies", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle watchlist
app.post("/watchlist/:movieId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { movieId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.watchlist.indexOf(movieId);
    if (index === -1) {
      user.watchlist.push(movieId);
    } else {
      user.watchlist.splice(index, 1);
    }

    await user.save();
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get watchlist
app.get("/watchlist/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("watchlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MongoDB =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ===== Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =======================
   MIDDLEWARE
======================= */

// ✅ CORS (mobile + web safe)
app.use(
  cors({
    origin: true,          // allow all origins
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ IMPORTANT: wildcard must be "*" NOT "/*"
app.options("*", cors());

app.use(express.json());

/* =======================
   SCHEMAS & MODELS
======================= */

const movieSchema = new mongoose.Schema({
  title: String,
  poster: String,
  trailer: String,
});

const Movie = mongoose.model("Movie", movieSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

const User = mongoose.model("User", userSchema);

/* =======================
   ROUTES
======================= */

// Root
app.get("/", (req, res) => {
  res.send("StreamFlix backend is running");
});

// Movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch {
    res.status(400).json({ message: "Invalid movie ID" });
  }
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Watchlist toggle
app.post("/watchlist/:movieId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { movieId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.watchlist.indexOf(movieId);
    index === -1
      ? user.watchlist.push(movieId)
      : user.watchlist.splice(index, 1);

    await user.save();
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/watchlist/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("watchlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =======================
   DATABASE
======================= */

mongoose
  .connect(
    "mongodb+srv://9050poojaap_db_user:I1AY0c8A0Y57ETTv@streamflix-cluster.jzf2g4g.mongodb.net/streamflixDB?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error(err));

/* =======================
   SERVER
======================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

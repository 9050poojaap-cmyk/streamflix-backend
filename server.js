const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Movie Schema
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String, required: true },
  trailer: { type: String, required: true },
});

// Movie Model
const Movie = mongoose.model("Movie", movieSchema);

// USER SCHEMA
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

const User = mongoose.model("User", userSchema);


// Root route
app.get("/", (req, res) => {
  res.send("StreamFlix backend is running");
});

// ✅ GET all movies (Home page)
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET movie by ID (Trailer page)
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

// ✅ ADD a new movie
app.post("/movies", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
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

// ADD / REMOVE WATCHLIST
app.post("/watchlist/:movieId", async (req, res) => {
  try {
    const { userId } = req.body;
    const { movieId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.watchlist.indexOf(movieId);

    if (index === -1) {
      user.watchlist.push(movieId); // add
    } else {
      user.watchlist.splice(index, 1); // remove
    }

    await user.save();
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET WATCHLIST
app.get("/watchlist/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("watchlist");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// MongoDB connection
mongoose
 mongoose
  .connect(
    "mongodb+srv://9050poojaap_db_user:I1AY0c8A0Y57ETTv@streamflix-cluster.jzf2g4g.mongodb.net/streamflixDB?retryWrites=true&w=majority"
  )
  .then(() => console.log("MongoDB Atlas connected to streamflixDB"))
  .catch((err) => console.log(err));

  

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

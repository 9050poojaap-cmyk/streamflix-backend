const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ SIMPLE & SAFE MIDDLEWARE
app.use(cors());
app.use(express.json());

// Schemas
const movieSchema = new mongoose.Schema({
  title: String,
  poster: String,
  trailer: String,
});

const Movie = mongoose.model("Movie", movieSchema);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.send("StreamFlix backend is running");
});

app.get("/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ userId: user._id });
});

// MongoDB
mongoose
  .connect("mongodb+srv://9050poojaap_db_user:I1AY0c8A0Y57ETTv@streamflix-cluster.jzf2g4g.mongodb.net/streamflixDB")
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));


const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth & Reports Routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("KGMU Cancer Care Backend Live - Helpline: 7237042741");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("===============================================");
  console.log(`KGMU Cancer Care Server Running on Port ${PORT}`);
  console.log("Storage: Local JSON Engine (patients_data.json)");
  console.log("Helpline Support: 7237042741");
  console.log("===============================================");
});
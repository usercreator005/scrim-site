require("dotenv").config();              // 1️⃣ ADD
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db"); // 2️⃣ ADD
const authRoutes = require("./routes/auth.routes");
process.on("uncaughtException", err => {
  console.error("UNCAUGHT:", err);
});

process.on("unhandledRejection", err => {
  console.error("UNHANDLED:", err);
});
/* ===============================
   CONNECT MONGO
================================ */
connectDB();                              // 3️⃣ ADD

/* ===============================
   ROUTES IMPORT
================================ */
const submissionRoutes = require("./routes/submission.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", authRoutes);

/* ===============================
   STATIC FOLDERS
================================ */
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/admin", express.static(path.join(__dirname, "../admin")));

/* ===============================
   ROUTES USE
================================ */
app.use("/", submissionRoutes);
app.use("/", adminRoutes);

/* ===============================
   ROOT TEST
================================ */
app.get("/", (req, res) => {
  res.send("Scrim Backend Running");
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

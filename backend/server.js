const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
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
   DAILY RESET SCHEDULER
   🔹 Free + mobile friendly
   🔹 Runs every minute, resets at 10 PM
================================ */
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 22 && now.getMinutes() === 0) {
    resetDailyRegistrations();
  }
}, 60 * 1000);


/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

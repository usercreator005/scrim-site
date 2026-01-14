const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/admin", express.static(path.join(__dirname, "../admin")));

/* ROOT TEST ROUTE */
app.get("/", (req, res) => {
  res.send("Scrim Backend Running");
});

/* MULTER CONFIG */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  }
});

/* FORM SUBMISSION */
app.post("/submit", upload.single("paymentSS"), (req, res) => {
  try {
    const { teamName, whatsapp, time, fee } = req.body;

    if (!teamName || !whatsapp || !time || !fee || !req.file) {
      return res.status(400).json({ message: "Missing data" });
    }

    const dbPath = path.join(__dirname, "db.json");
    let db = { submissions: [] };

    try {
      db = JSON.parse(fs.readFileSync(dbPath));
      if (!db.submissions) db.submissions = [];
    } catch {
      db = { submissions: [] };
    }

    if (db.submissions.filter(r => r.time === time).length >= 36) {
      return res.status(400).json({ message: "Slot full" });
    }

    db.submissions.push({
      id: Date.now(),
      teamName,
      whatsapp,
      time,
      fee,
      screenshot: req.file.filename,
      status: "pending"
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.json({ message: "Submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* CHECK SLOTS */
app.get("/checkSlots", (req, res) => {
  const dbPath = path.join(__dirname, "db.json");
  let db = { submissions: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); } catch {}
  const slots = {};
  ["12:00 PM", "3:00 PM", "9:00 PM"].forEach(
    s => slots[s] = db.submissions.filter(r => r.time === s).length
  );
  res.json(slots);
});

/* ADMIN */
app.get("/adminRegs", (req, res) => {
  const dbPath = path.join(__dirname, "db.json");
  let db = { submissions: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); } catch {}
  res.json(db.submissions);
});

/* 🔥 ONLY ONE LISTEN */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

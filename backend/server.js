const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   MIDDLEWARE
================================ */
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

/* ===============================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
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

/* ===============================
   FORM SUBMISSION
================================ */
app.post("/submit", upload.single("paymentSS"), (req, res) => {
  try {
    const { teamName, whatsapp, time, fee } = req.body;
    const paymentSS = req.file;

    /* ===============================
       STEP 3.1 – STRONG VALIDATIONS
       =============================== */

    // Required fields
    if (!teamName || !whatsapp || !time || !fee) {
      return res.status(400).json({
        success: false,
        errorCode: "VALIDATION_ERROR",
        message: "All fields are required"
      });
    }

    if (!paymentSS) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_FILE",
        message: "Payment screenshot is required"
      });
    }

    // WhatsApp validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(whatsapp)) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_WHATSAPP",
        message: "Invalid WhatsApp number"
      });
    }

    // Team name clean
    const cleanTeamName = teamName.trim();
    if (cleanTeamName.length < 3) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_TEAM_NAME",
        message: "Team name must be at least 3 characters"
      });
    }

    // Allowed values
    const allowedTimes = ["12:00 PM", "3:00 PM", "9:00 PM"];
    const allowedFees = ["₹20", "₹25", "₹30"];

    if (!allowedTimes.includes(time) || !allowedFees.includes(fee)) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_SLOT_FEE",
        message: "Invalid slot or fee selected"
      });
    }

    /* ===============================
       LOAD DATABASE
       =============================== */
    const dbPath = path.join(__dirname, "db.json");
    let db = { submissions: [] };

    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      if (!db.submissions) db.submissions = [];
    } catch {
      db = { submissions: [] };
    }

    /* ===============================
       STEP 3.2 – DUPLICATE CHECK
       Rule:
       ❌ Same team name + same time
       ✅ Same team + different time allowed
       ✅ Same WhatsApp allowed
       =============================== */
    const duplicate = db.submissions.find(
      r =>
        r.time === time &&
        r.teamName.toLowerCase() === cleanTeamName.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        errorCode: "DUPLICATE_TEAM_SLOT",
        message:
          "This team is already registered for the selected time slot"
      });
    }

    /* ===============================
       SAVE SUBMISSION
       =============================== */
    db.submissions.push({
      id: Date.now(),
      teamName: cleanTeamName,
      whatsapp,
      time,
      fee,
      screenshot: paymentSS.filename,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return res.json({
      success: true,
      message: "Submitted successfully"
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    return res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Something went wrong. Try again later."
    });
  }
});

/* ===============================
   CHECK SLOTS (COUNT ONLY)
================================ */
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

/* ===============================
   ADMIN REGISTRATIONS
================================ */
app.get("/adminRegs", (req, res) => {
  const dbPath = path.join(__dirname, "db.json");
  let db = { submissions: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); } catch {}
  res.json(db.submissions);
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

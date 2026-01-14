const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = 3000;

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../frontend")));
// ✅ Serve admin folder
app.use("/admin", express.static(path.join(__dirname, "../admin")));

/* MULTER CONFIG */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
    cb(null, true);
  }
});

/* FORM SUBMISSION ROUTE */
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
    } catch { db = { submissions: [] }; }

    const slotTeams = db.submissions.filter(r => r.time === time);
    if (slotTeams.length >= 36) {
      return res.status(400).json({ message: "Slot full. Choose another time." });
    }

    const newEntry = {
      id: Date.now(),
      teamName,
      whatsapp,
      time,
      fee,
      screenshot: req.file.filename,
      status: "pending"
    };

    db.submissions.push(newEntry);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({ message: "Submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* CHECK SLOT COUNT FOR FRONTEND */
app.get("/checkSlots", (req, res) => {
  const dbPath = path.join(__dirname, "db.json");
  let db = { submissions: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); if (!db.submissions) db.submissions = []; } catch { db={submissions:[]}; }

  const slots = {};
  ["12:00 PM", "3:00 PM", "9:00 PM"].forEach(slot => {
    slots[slot] = db.submissions.filter(r => r.time === slot).length;
  });

  res.json(slots);
});

/* ADMIN ROUTES */
app.get("/adminRegs", (req,res) => {
  const dbPath = path.join(__dirname, "db.json");
  let db = { submissions: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); if(!db.submissions) db.submissions=[]; } catch { db={submissions:[]}; }
  res.json(db.submissions);
});

app.post("/adminAction/:i", (req,res) => {
  const { status } = req.body;
  const index = parseInt(req.params.i);

  const dbPath = path.join(__dirname, "db.json");
  let db = { submissions: [] };
  try { db = JSON.parse(fs.readFileSync(dbPath)); } catch { db={submissions:[]}; }

  if(db.submissions[index]){
    db.submissions[index].status = status;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }

  res.json({ message: "Done" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../db.json");

function checkAndResetIfNeeded() {
  let db = { submissions: [], lastReset: null };

  try {
    db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    if (!db.submissions) db.submissions = [];
  } catch {
    db = { submissions: [], lastReset: null };
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Check if last reset is before today
  if (db.lastReset !== today) {
    db.submissions = [];       // Clear all registrations
    db.lastReset = today;      // Update last reset date
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log("Daily reset done for:", today);
  }
}

function manualReset() {
  let db = { submissions: [], lastReset: null };
  try {
    db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {}

  const today = new Date().toISOString().slice(0, 10);
  db.submissions = [];
  db.lastReset = today;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log("Manual reset done for:", today);
}

function getLastResetDate() {
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    return db.lastReset || null;
  } catch {
    return null;
  }
}

module.exports = {
  checkAndResetIfNeeded,
  manualReset,
  getLastResetDate
};
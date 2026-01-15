const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../db.json");

/**
 * 🔁 Checks if the last reset was before today.
 * If yes, clears all registrations and updates lastReset date.
 */
function checkAndResetIfNeeded() {
  let db = { submissions: [], lastReset: null };

  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    db = JSON.parse(raw);
    if (!db.submissions) db.submissions = [];
  } catch {
    db = { submissions: [], lastReset: null };
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (db.lastReset !== today) {
    db.submissions = [];       // Clear all registrations
    db.lastReset = today;      // Update last reset
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log(`[RESET] Daily reset done for: ${today}`);
  }
}

/**
 * 🛠 Manual reset triggered by admin
 */
function manualReset() {
  let db = { submissions: [], lastReset: null };
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    db = JSON.parse(raw);
  } catch {}

  const today = new Date().toISOString().slice(0, 10);
  db.submissions = [];
  db.lastReset = today;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log(`[RESET] Manual reset done for: ${today}`);
}

/**
 * 📅 Returns last reset date
 */
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
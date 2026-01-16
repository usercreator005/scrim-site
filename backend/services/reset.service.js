const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../db.json");

/**
 * ❌ AUTO RESET DISABLED
 * Render sleep issue ki wajah se
 */
// function checkAndResetIfNeeded() {
//   // ❌ DO NOT USE
// }

/**
 * 🛠 Manual reset triggered by admin ONLY
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
 * 📅 Returns last reset date (admin dashboard ke liye)
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
  manualReset,
  getLastResetDate
};
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../db.json");

function checkAndResetIfNeeded() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const data = JSON.parse(raw);

  const today = new Date().toISOString().split("T")[0];

  if (data.lastReset !== today) {
    data.submissions = [];
    data.lastReset = today;

    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    console.log("✅ Daily registrations reset");
  }
}

module.exports = { checkAndResetIfNeeded };

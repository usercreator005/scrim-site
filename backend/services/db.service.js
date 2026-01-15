const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../db.json");

/* ===============================
   READ DATABASE
================================ */
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    const json = JSON.parse(data);
    if (!json.submissions) json.submissions = [];
    return json;
  } catch (err) {
    return { submissions: [] };
  }
}

/* ===============================
   WRITE DATABASE
================================ */
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/* ===============================
   UPDATE STATUS BY ID
================================ */
function updateStatusById(id, status) {
  const db = readDB();
  const index = db.submissions.findIndex(item => item.id === id);
  if (index === -1) return false;
  db.submissions[index].status = status;
  writeDB(db);
  return true;
}

/* ===============================
   DAILY RESET FUNCTION (PHASE 5)
================================ */
function resetDailyRegistrations() {
  writeDB({ submissions: [] });
  console.log("✅ Daily reset done at 10 PM");
}

module.exports = {
  readDB,
  writeDB,
  updateStatusById,
  resetDailyRegistrations
};

const Registration = require("../models/Registration");

/* 🛠 Manual reset (ADMIN ONLY) */
async function manualReset() {
  await Registration.deleteMany({});
  console.log("All registrations reset");
}

/* 📅 Dummy last reset date */
function getLastResetDate() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  manualReset,
  getLastResetDate
};

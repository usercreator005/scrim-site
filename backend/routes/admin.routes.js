const express = require("express");
const router = express.Router();
const adminAuth = require("../middlewares/adminAuth.middleware");
const { createLobby } = require("../controllers/admin.controller");
const { getAllLobbies } = require("../controllers/lobby.controller");
const {
  getAllRegistrations,
  adminAction
} = require("../controllers/admin.controller");

const { manualReset, getLastResetDate } = require("../services/reset.service");

/* ===============================
   REGISTRATION ROUTES
================================ */
router.get("/adminRegs", adminAuth, getAllRegistrations);
router.post("/adminAction/:id", adminAuth, adminAction);

const {
  createOrUpdateLobbyConfig,
  getLobbyConfigs
} = require("../controllers/adminController");

router.post("/lobbyConfig", adminAuth, createOrUpdateLobbyConfig);
router.get("/lobbyConfig", adminAuth, getLobbyConfigs);

// Set lobby WhatsApp link for a specific time + fee
router.post("/admin/lobbyLink", adminAuth, async (req, res) => {
  const { time, fee, link } = req.body;
  if (!time || !fee || !link) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  try {
    // Update all accepted registrations with matching time + fee
    await Registration.updateMany(
      { time, fee },
      { $set: { lobbyLink: link } }
    );
    res.json({ success: true, message: "Lobby link saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
/* ===============================
   MANUAL RESET ROUTES
================================ */

// Trigger manual reset
router.post("/admin/manualReset", adminAuth, (req, res) => {
  try {
    manualReset();
    res.json({ success: true, message: "Manual reset done successfully" });
  } catch (err) {
    console.error("[RESET ERROR]", err);
    res.status(500).json({ success: false, message: "Manual reset failed" });
  }
});

// Get last reset date
router.get("/admin/lastReset", adminAuth, (req, res) => {
  try {
    const lastReset = getLastResetDate();
    res.json({ success: true, lastReset });
  } catch (err) {
    console.error("[LAST RESET ERROR]", err);
    res.status(500).json({ success: false, message: "Could not fetch last reset" });
  }
});
router.post("/admin/createLobby", adminAuth, createLobby);
router.get("/admin/lobbies", adminAuth, getAllLobbies);
const { getLobbyLimits, setLobbyLimit } = require("../controllers/admin.controller");

// Get all lobby limits
router.get("/admin/lobbyLimits", adminAuth, getLobbyLimits);

// Set / update lobby limit
router.post("/admin/lobbyLimits", adminAuth, setLobbyLimit);


module.exports = router;
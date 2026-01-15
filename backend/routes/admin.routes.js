const express = require("express");
const router = express.Router();
const adminAuth = require("../middlewares/adminAuth.middleware");

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

/* ===============================
   MANUAL RESET ROUTES
================================ */
router.post("/admin/manualReset", adminAuth, (req, res) => {
  manualReset();
  res.json({ success: true, message: "Manual reset done" });
});

router.get("/admin/lastReset", adminAuth, (req, res) => {
  const lastReset = getLastResetDate();
  res.json({ lastReset });
});

module.exports = router;
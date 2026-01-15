const adminAuth = require("../middlewares/adminAuth.middleware");
const express = require("express");
const router = express.Router();

const {
  getAllRegistrations,
  adminAction
} = require("../controllers/admin.controller");

router.get("/adminRegs", adminAuth, getAllRegistrations);
router.post("/adminAction/:id", adminAuth, adminAction);
module.exports = router;
const { manualReset, getLastResetDate } = require("../services/reset.service");

router.post("/admin/manualReset", adminAuth, (req, res) => {
  manualReset();
  res.json({ success: true, message: "Manual reset done" });
});

router.get("/admin/lastReset", adminAuth, (req, res) => {
  const lastReset = getLastResetDate();
  res.json({ lastReset });
});
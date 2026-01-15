const express = require("express");
const router = express.Router();

const {
  getAllRegistrations,
  adminAction
} = require("../controllers/admin.controller");

router.get("/adminRegs", getAllRegistrations);

// 🔥 ID based (SAFE)
router.post("/adminAction/:id", adminAction);

module.exports = router;

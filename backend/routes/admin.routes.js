const { adminAuth } = require("../middlewares/adminAuth.middleware");
const express = require("express");
const router = express.Router();

const {
  getAllRegistrations,
  adminAction
} = require("../controllers/admin.controller");

router.get("/adminRegs", adminAuth, getAllRegistrations);
router.post("/adminAction/:id", adminAuth, adminAction);
module.exports = router;

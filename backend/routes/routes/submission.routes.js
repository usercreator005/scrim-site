const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  submitRegistration
} = require("../controllers/controllers/submission.controller");

/* ===============================
   MULTER CONFIG (ROUTE LEVEL)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  }
});

/* ===============================
   ROUTE
================================ */
router.post(
  "/submit",
  upload.single("paymentSS"),
  submitRegistration
);

module.exports = router;

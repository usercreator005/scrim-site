const { addToken } = require("../middlewares/adminAuth.middleware");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SECRET = process.env.ADMIN_SECRET || "scrim-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

exports.adminLogin = (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password required"
    });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Invalid password"
    });
  }

  // Simple token
const token = jwt.sign(
  { role: "admin" },
  SECRET,
  { expiresIn: "2h" }   // Token valid for 2 hours
);
res.json({
    success: true,
    token,
    message: "Login successful"
  });
};

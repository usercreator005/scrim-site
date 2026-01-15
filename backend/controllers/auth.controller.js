const crypto = require("crypto");

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
  const token = crypto.randomBytes(24).toString("hex");

  res.json({
    success: true,
    token,
    message: "Login successful"
  });
};

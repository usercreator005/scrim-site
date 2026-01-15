const jwt = require("jsonwebtoken");

const SECRET = process.env.ADMIN_SECRET || "scrim-secret";

function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    // 🕒 Expiry auto check hoti hai yaha
    req.admin = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid"
    });
  }
}

module.exports = adminAuth;

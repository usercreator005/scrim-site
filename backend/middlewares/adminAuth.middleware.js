// Simple in-memory token store
const validTokens = new Set();

function addToken(token) {
  validTokens.add(token);
}

function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Admin token missing"
    });
  }

  if (!validTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }

  next();
}

module.exports = {
  adminAuth,
  addToken
};

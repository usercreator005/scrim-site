const { readDB, updateStatusById } = require("../services/db.service");

/* ===============================
   GET ALL REGISTRATIONS
================================ */
exports.getAllRegistrations = (req, res) => {
  const db = readDB();
  res.json(db.submissions);
};

/* ===============================
   ADMIN ACTION
================================ */
exports.adminAction = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({
      success: false,
      message: "ID and status required"
    });
  }

  const updated = updateStatusById(Number(id), status);

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Registration not found"
    });
  }

  res.json({
    success: true,
    message: "Status updated successfully"
  });
};

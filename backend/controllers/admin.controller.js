const Registration = require("../models/Registration");

exports.getAllRegistrations = async (req, res) => {
  const data = await Registration.find().sort({ createdAt: -1 });
  res.json(data);
};

exports.adminAction = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status required"
    });
  }

  const updated = await Registration.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

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

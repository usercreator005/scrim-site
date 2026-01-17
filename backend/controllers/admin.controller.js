const Registration = require("../models/Registration");
const LobbyConfig = require("../models/LobbyConfig");

exports.getAllRegistrations = async (req, res) => {
  const data = await Registration.find().sort({ createdAt: -1 });
  res.json(data);
};

exports.adminAction = async (req, res) => {
  const { id } = req.params;
  const status = req.body.status?.toLowerCase();

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
exports.createOrUpdateLobbyConfig = async (req, res) => {
  try {
    const { time, fee, maxLobbies, lobbies } = req.body;

    if (!time || !fee || !maxLobbies || !lobbies) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (lobbies.length !== maxLobbies) {
      return res.status(400).json({
        success: false,
        message: "Lobby count and links mismatch"
      });
    }

    const existing = await LobbyConfig.findOne({ time, fee });

    if (existing) {
      existing.maxLobbies = maxLobbies;
      existing.lobbies = lobbies;
      await existing.save();

      return res.json({
        success: true,
        message: "Lobby config updated"
      });
    }

    await LobbyConfig.create({
      time,
      fee,
      maxLobbies,
      lobbies
    });

    res.json({
      success: true,
      message: "Lobby config created"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getLobbyConfigs = async (req, res) => {
  try {
    const configs = await LobbyConfig.find().sort({ createdAt: -1 });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
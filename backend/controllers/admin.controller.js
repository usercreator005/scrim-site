const Registration = require("../models/Registration");
const LobbyLimit = require("../models/LobbyLimit");

/* ===============================
   GET ALL REGISTRATIONS
================================ */
exports.getAllRegistrations = async (req, res) => {
  const data = await Registration.find().sort({ createdAt: -1 });
  res.json(data);
};

/* ===============================
   ADMIN ACTION (ACCEPT/REJECT)
================================ */
exports.adminAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ success:false, message:"Status required" });

    const reg = await Registration.findById(id);
    if (!reg) return res.status(404).json({ success:false, message:"Registration not found" });

    reg.status = status;

    if(status === "accepted") {
      // Get lobby link if already saved
      const lobbyLimit = await LobbyLimit.findOne({ time: reg.time, fee: reg.fee });
      if(lobbyLimit && lobbyLimit.lobbyLink) {
        reg.lobbyLink = lobbyLimit.lobbyLink;
      }
    }

    await reg.save();

    res.json({ success:true, message:"Status updated", lobbyLink: reg.lobbyLink });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/* ===============================
   GET LOBBY LIMITS
================================ */
exports.getLobbyLimits = async (req, res) => {
  const limits = await LobbyLimit.find().sort({ time:1, fee:1 });
  res.json(limits);
};

/* ===============================
   SET / UPDATE LOBBY LIMIT
================================ */
exports.setLobbyLimit = async (req, res) => {
  try {
    const { time, fee, maxLobby, lobbyLink } = req.body;
    if(!time || !fee || !maxLobby) return res.status(400).json({ success:false, message:"All fields required" });

    const existing = await LobbyLimit.findOne({ time, fee });
    if(existing) {
      existing.maxLobby = maxLobby;
      if(lobbyLink) existing.lobbyLink = lobbyLink;
      await existing.save();
    } else {
      await LobbyLimit.create({ time, fee, maxLobby, lobbyLink: lobbyLink || "" });
    }

    res.json({ success:true, message:"Lobby limit saved successfully" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
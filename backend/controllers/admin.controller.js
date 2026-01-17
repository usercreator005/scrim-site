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
   ADMIN ACTION: Accept / Reject
================================ */
exports.adminAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ success:false, message:"Status required" });

    const reg = await Registration.findById(id);
    if (!reg) return res.status(404).json({ success:false, message:"Registration not found" });

    let lobbyNo = null;

    if(status === "accepted"){
      // Count accepted for same time+fee
      const count = await Registration.countDocuments({
        time: reg.time,
        fee: reg.fee,
        status: "accepted"
      });

      // Calculate lobby number
      lobbyNo = Math.floor(count / 12) + 1;

      reg.lobbyNo = lobbyNo;
    }

    reg.status = status;
    await reg.save();

    res.json({
      success:true,
      message:"Status updated",
      lobbyNo,
      lobbyLink: reg.lobbyLink || ""
    });

  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/* ===============================
   LOBBY LIMITS
================================ */
exports.getLobbyLimits = async (req, res) => {
  const limits = await LobbyLimit.find().sort({ time:1, fee:1 });
  res.json(limits);
};

exports.setLobbyLimit = async (req, res) => {
  try {
    const { time, fee, maxLobby } = req.body;
    if(!time || !fee || !maxLobby)
      return res.status(400).json({ success:false, message:"All fields required" });

    let existing = await LobbyLimit.findOne({ time, fee });

    if(existing){
      existing.maxLobby = maxLobby;
      await existing.save();
      return res.json({ success:true, message:"Lobby limit updated" });
    }

    await LobbyLimit.create({ time, fee, maxLobby });
    res.json({ success:true, message:"Lobby limit set" });

  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};

/* ===============================
   SET LOBBY WHATSAPP LINK
================================ */
exports.setLobbyLink = async (req,res)=>{
  try{
    const { time, fee, link } = req.body;
    if(!time || !fee || !link)
      return res.status(400).json({ success:false, message:"Missing data" });

    await Registration.updateMany(
      { time, fee, status:"accepted" },
      { $set:{ lobbyLink: link } }
    );

    res.json({ success:true, message:"Lobby link saved" });

  } catch(err){
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
};
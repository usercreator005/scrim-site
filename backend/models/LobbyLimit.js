const mongoose = require("mongoose");

const lobbyLimitSchema = new mongoose.Schema({
  time: { type: String, required: true },
  fee: { type: Number, required: true },
  maxLobby: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("LobbyLimit", lobbyLimitSchema);
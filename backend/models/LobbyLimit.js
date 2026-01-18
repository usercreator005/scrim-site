const mongoose = require("mongoose");

const lobbyLimitSchema = new mongoose.Schema({
  time: { type: String, required: true },
  fee: { type: Number, required: true },
  maxLobby: { type: Number, required: true },
  lobbyLink: { type: String, default: "" }
});

module.exports = mongoose.model("LobbyLimit", lobbyLimitSchema);
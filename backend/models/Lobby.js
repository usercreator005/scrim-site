const mongoose = require("mongoose");

const lobbySchema = new mongoose.Schema({
  time: { type: String, required: true },
  fee: { type: Number, required: true },

  lobbyNo: { type: Number, required: true },   // Lobby 1,2,3
  maxTeams: { type: Number, default: 12 },

  whatsappGroupLink: { type: String, required: true },

  currentTeams: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Lobby", lobbySchema);
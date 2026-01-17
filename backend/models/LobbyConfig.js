const mongoose = require("mongoose");

const lobbySchema = new mongoose.Schema({
  lobbyNo: {
    type: Number,
    required: true
  },
  whatsappLink: {
    type: String,
    required: true
  }
});

const lobbyConfigSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true
    },

    fee: {
      type: Number,
      required: true
    },

    maxLobbies: {
      type: Number,
      required: true
    },

    lobbies: {
      type: [lobbySchema],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LobbyConfig", lobbyConfigSchema);
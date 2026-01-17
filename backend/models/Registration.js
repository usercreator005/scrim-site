const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  teamName: String,
  whatsapp: String,
  time: String,
  fee: Number,
  screenshot: String,

  status: { type: String, default: "pending" },

  lobbyNo: Number,                // 🆕 assigned lobby
  lobbyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lobby"
  }

}, { timestamps: true });

module.exports = mongoose.model("Registration", submissionSchema);
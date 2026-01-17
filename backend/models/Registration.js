const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  whatsapp: { type: String, required: true },
  time: { type: String, required: true },
  fee: { type: Number, required: true },
  screenshot: { type: String, required: true },
  status: { type: String, default: "pending" },
  lobbyNo: { type: Number, default: null },
  lobbyLink: { type: String, default: "" } // WhatsApp group link per team
}, { timestamps: true });

module.exports = mongoose.model("Registration", registrationSchema);
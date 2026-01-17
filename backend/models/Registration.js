const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  teamName: String,
  whatsapp: String,
  time: String,
  fee: Number,
  screenshot: String,

  status: {
    type: String,
    default: "pending"
  },

  lobbyNo: {
    type: Number,
    default: null
  }
});

module.exports = mongoose.model("Registration", registrationSchema);
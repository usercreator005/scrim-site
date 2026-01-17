const mongoose = require("mongoose");
const submissionSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  whatsapp: { type: String, required: true },
  time: { type: String, required: true },
  fee: { type: Number, required: true },
  screenshot: { type: String, required: true },
  status: { type: String, default: "pending" },
  lobbyLink: { type: String, default: "" } // <-- New field
}, { timestamps: true });
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
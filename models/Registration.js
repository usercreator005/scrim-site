const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  fee: {
    type: Number,
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "Accepted", "Rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Registration", registrationSchema);

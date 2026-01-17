const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  teamName: String,
  whatsapp: String,
  time: String,
  fee: Number,
  screenshot: String,

  // 🔽 🔽 🔽 YAHI ADD KARNA HAI
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Registration", registrationSchema);

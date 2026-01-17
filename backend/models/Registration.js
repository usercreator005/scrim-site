const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  whatsapp: { type: String, required: true },
  time: { type: String, required: true },
  fee: { type: Number, required: true },
  screenshot: { type: String, required: true },
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);

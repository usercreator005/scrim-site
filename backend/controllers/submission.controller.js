const Registration = require("../models/Registration");
const {
  validateTeamName,
  validateWhatsapp,
  validateSlotFee,
  validatePaymentFile
} = require("../utils/validators");

/* ===============================
   SUBMIT CONTROLLER (MONGO)
================================ */
exports.submitRegistration = async (req, res) => {
  try {
    const { teamName, whatsapp, time, fee } = req.body;
    const paymentSS = req.file;

    /* VALIDATION */
    const error =
      validateTeamName(teamName) ||
      validateWhatsapp(whatsapp) ||
      validateSlotFee(time, fee) ||
      validatePaymentFile(paymentSS);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    /* DUPLICATE CHECK (same team + same time) */
    const duplicate = await Registration.findOne({
      teamName: teamName.trim(),
      time
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Team already registered for this slot"
      });
    }

    /* SAVE TO MONGO */
    await Registration.create({
      teamName: teamName.trim(),
      whatsapp,
      time,
      fee,
      screenshot: paymentSS.filename
    });

    res.json({
      success: true,
      message: "Submitted successfully"
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

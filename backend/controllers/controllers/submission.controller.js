const fs = require("fs");
const path = require("path");

const {
  validateTeamName,
  validateWhatsapp,
  validateSlotFee,
  validatePaymentFile
} = require("../utils/utils/validators");

/* ===============================
   SUBMIT CONTROLLER
================================ */
exports.submitRegistration = (req, res) => {
  try {
    const { teamName, whatsapp, time, fee } = req.body;
    const paymentSS = req.file;

    /* ===============================
       VALIDATIONS
    =============================== */
    let error =
      validateTeamName(teamName) ||
      validateWhatsapp(whatsapp) ||
      validateSlotFee(time, fee) ||
      validatePaymentFile(paymentSS);

    if (error) {
      return res.status(400).json({
        success: false,
        errorCode: "VALIDATION_ERROR",
        message: error
      });
    }

    const cleanTeamName = teamName.trim();

    /* ===============================
       LOAD DATABASE
    =============================== */
    const dbPath = path.join(__dirname, "../db.json");
    let db = { submissions: [] };

    try {
      db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      if (!db.submissions) db.submissions = [];
    } catch {
      db = { submissions: [] };
    }

    /* ===============================
       DUPLICATE CHECK
       ❌ Same team + same time
    =============================== */
    const duplicate = db.submissions.find(
      r =>
        r.time === time &&
        r.teamName.toLowerCase() === cleanTeamName.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        errorCode: "DUPLICATE_TEAM_SLOT",
        message:
          "This team is already registered for the selected time slot"
      });
    }

    /* ===============================
       SAVE
    =============================== */
    db.submissions.push({
      id: Date.now(),
      teamName: cleanTeamName,
      whatsapp,
      time,
      fee,
      screenshot: paymentSS.filename,
      status: "pending",
      createdAt: new Date().toISOString()
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return res.json({
      success: true,
      message: "Submitted successfully"
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    return res.status(500).json({
      success: false,
      errorCode: "SERVER_ERROR",
      message: "Something went wrong. Try again later."
    });
  }
};

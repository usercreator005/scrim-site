/* ===============================
   VALIDATORS
================================ */

/* TEAM NAME */
function validateTeamName(teamName) {
  if (!teamName) {
    return "Team name is required";
  }

  const clean = teamName.trim();

  if (clean.length < 3) {
    return "Team name must be at least 3 characters";
  }

  return null;
}

/* WHATSAPP NUMBER */
function validateWhatsapp(whatsapp) {
  if (!whatsapp) {
    return "WhatsApp number is required";
  }

  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(whatsapp)) {
    return "Invalid WhatsApp number";
  }

  return null;
}

/* SLOT + FEE */
function validateSlotFee(time, fee) {
  const allowedTimes = ["12:00 PM", "3:00 PM", "9:00 PM"];
  const allowedFees = ["₹20", "₹25", "₹30"];

  if (!allowedTimes.includes(time)) {
    return "Invalid time slot selected";
  }

  if (!allowedFees.includes(fee)) {
    return "Invalid fee selected";
  }

  return null;
}

/* PAYMENT SCREENSHOT */
function validatePaymentFile(file) {
  if (!file) {
    return "Payment screenshot is required";
  }

  return null;
}

/* ===============================
   EXPORT ALL
================================ */
module.exports = {
  validateTeamName,
  validateWhatsapp,
  validateSlotFee,
  validatePaymentFile
};

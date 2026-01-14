console.log("SCRIPT LOADED");

/* ===============================
   TOAST HELPER
================================ */
function showToast(message, isError = false) {
  // Create toast container if not exists
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.background = isError ? "#f44336" : "#4CAF50"; // red or green
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.marginTop = "10px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  toast.style.opacity = "0";
  toast.style.transition = "0.5s";

  container.appendChild(toast);

  // Fade in
  setTimeout(() => toast.style.opacity = "1", 10);

  // Fade out & remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

/* ===============================
   DOM CONTENT LOADED
================================ */
document.addEventListener("DOMContentLoaded", () => {

  const timeButtons = document.querySelectorAll("#timeSlots button");
  const feeButtons = document.querySelectorAll("#feeSlots button");

  const teamName = document.getElementById("teamName");
  const whatsapp = document.getElementById("whatsapp");
  const paymentSS = document.getElementById("paymentSS");
  const submitBtn = document.getElementById("submitBtn");

  let selectedTime = null;
  let selectedFee = null;

  /* INITIAL STATE */
  feeButtons.forEach(b => b.disabled = true);
  paymentSS.disabled = true;
  submitBtn.disabled = true;

  /* TIME SELECTION */
  timeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      timeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTime = btn.dataset.time;

      feeButtons.forEach(f => f.disabled = false);
    });
  });

  /* FEE SELECTION */
  feeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      feeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedFee = btn.innerText;

      teamName.disabled = false;
      whatsapp.disabled = false;
      paymentSS.disabled = false;
      submitBtn.disabled = false;
    });
  });

  /* COPY UPI – MOBILE SAFE */
  window.copyUpiManual = function () {
    const upi = document.getElementById("upiText").innerText;

    const temp = document.createElement("input");
    temp.value = upi;
    document.body.appendChild(temp);
    temp.select();
    temp.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(temp);

    showToast("UPI Copied: " + upi);
  };

  /* FORM SUBMIT */
  document.getElementById("scrimForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedTime || !selectedFee) {
      showToast("Select time and fee", true);
      return;
    }

    if (whatsapp.value.length !== 10) {
      showToast("Enter valid WhatsApp number", true);
      return;
    }

    if (!paymentSS.files.length) {
      showToast("Upload payment screenshot", true);
      return;
    }

    const formData = new FormData();
    formData.append("teamName", teamName.value);
    formData.append("whatsapp", whatsapp.value);
    formData.append("time", selectedTime);
    formData.append("fee", selectedFee);
    formData.append("paymentSS", paymentSS.files[0]);

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = "Submitting...";

      const res = await fetch("/submit", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if(data.success){
        showToast(data.message);
      } else {
        showToast(data.message || "Error submitting form", true);
      }

      /* RESET FORM */
      document.getElementById("scrimForm").reset();

      selectedTime = null;
      selectedFee = null;

      timeButtons.forEach(b => b.classList.remove("active"));
      feeButtons.forEach(b => {
        b.classList.remove("active");
        b.disabled = true;
      });

      teamName.disabled = true;
      whatsapp.disabled = true;
      paymentSS.disabled = true;

    } catch (err) {
      console.error(err);
      showToast("Server error", true);
    } finally {
      submitBtn.innerText = "Submit";
      submitBtn.disabled = true; // stays disabled until user selects again
    }
  });

});

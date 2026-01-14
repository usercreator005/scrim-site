console.log("SCRIPT LOADED");

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

    alert("UPI Copied: " + upi);
  };

  /* FORM SUBMIT */
  document.getElementById("scrimForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedTime || !selectedFee) {
      alert("Select time and fee");
      return;
    }

    if (whatsapp.value.length !== 10) {
      alert("Enter valid WhatsApp number");
      return;
    }

    if (!paymentSS.files.length) {
      alert("Upload payment screenshot");
      return;
    }

    const formData = new FormData();
    formData.append("teamName", teamName.value);
    formData.append("whatsapp", whatsapp.value);
    formData.append("time", selectedTime);
    formData.append("fee", selectedFee);
    formData.append("paymentSS", paymentSS.files[0]);

    try {
      const res = await fetch("/submit", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.message);
      document.getElementById("scrimForm").reset();
      location.reload();

    } catch (err) {
      alert("Server error");
    }
  });

});

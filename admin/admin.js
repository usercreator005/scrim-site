const BACKEND_URL = "https://scrim-backend.onrender.com";

// 🔐 Admin token (login ke time save hua hoga)
const ADMIN_TOKEN = localStorage.getItem("adminToken");

if (!ADMIN_TOKEN) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
}

/* ===============================
   LOAD REGISTRATIONS
================================ */
async function loadRegistrations() {
  try {
    const res = await fetch(`${BACKEND_URL}/adminRegs`, {
      headers: {
        "x-admin-token": ADMIN_TOKEN
      }
    });

    if (res.status === 401) {
      alert("Unauthorized. Please login again.");
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("adminTable");
    tbody.innerHTML = "";

    data.forEach((reg) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.teamName}</td>
        <td>${reg.whatsapp}</td>
        <td>${reg.time}</td>
        <td>${reg.fee}</td>
        <td>
          <a href="${BACKEND_URL}/uploads/${reg.screenshot}" target="_blank">
            View
          </a>
        </td>
        <td class="status-${reg.status.toLowerCase()}">${reg.status}</td>
        <td>
          <button class="accept"
            onclick="adminAction(${reg.id}, 'Accepted', '${reg.whatsapp}')">
            Accept
          </button>

          <button class="reject"
            onclick="adminAction(${reg.id}, 'Rejected', '${reg.whatsapp}')">
            Reject
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading registrations:", err);
  }
}

/* ===============================
   ADMIN ACTION (ID BASED)
================================ */
async function adminAction(id, status, whatsappNumber) {
  try {
    const res = await fetch(`${BACKEND_URL}/adminAction/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({ status })
    });

    if (res.status === 401) {
      alert("Unauthorized. Please login again.");
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
      return;
    }

    // 📲 WhatsApp notification
    if (whatsappNumber) {
      const message = `Hello! Your Free Fire Scrim registration has been ${status}.`;
      const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }

    // 🔄 Reload table
    loadRegistrations();

  } catch (err) {
    console.error("Admin action failed:", err);
  }
}

/* ===============================
   INIT
================================ */
loadRegistrations();

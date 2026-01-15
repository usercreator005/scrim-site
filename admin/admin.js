const BACKEND_URL = "https://scrim-backend.onrender.com";
const ADMIN_TOKEN = localStorage.getItem("adminToken");

if (!ADMIN_TOKEN) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

// Load last reset date
async function loadLastReset() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lastReset`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    const data = await res.json();
    document.getElementById("lastReset").innerText = data.lastReset || "Never";
  } catch(err) { console.error(err); document.getElementById("lastReset").innerText = "Error"; }
}

// Manual reset
async function manualReset() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/manualReset`, {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    const data = await res.json();
    alert(data.message);
    loadLastReset();
    loadRegistrations(); // refresh table after reset
  } catch(err) { console.error(err); alert("Reset failed"); }
}

/* ===============================
   LOAD REGISTRATIONS
================================ */
async function loadRegistrations() {
  try {
    const res = await fetch(`${BACKEND_URL}/adminRegs`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    if (res.status === 401) {
      alert("Unauthorized. Login again.");
      logout();
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("adminTable");
    tbody.innerHTML = "";

    data.forEach(reg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.teamName}</td>
        <td>${reg.whatsapp}</td>
        <td>${reg.time}</td>
        <td>${reg.fee}</td>
        <td><a href="${BACKEND_URL}/uploads/${reg.screenshot}" target="_blank">View</a></td>
        <td class="status-${reg.status.toLowerCase()}">${reg.status}</td>
        <td>
          <button class="accept" onclick="adminAction(${reg.id}, 'Accepted', '${reg.whatsapp}')">Accept</button>
          <button class="reject" onclick="adminAction(${reg.id}, 'Rejected', '${reg.whatsapp}')">Reject</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(err) { console.error("Error loading registrations:", err); }
}

// Admin action
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
    if (res.status === 401) { alert("Unauthorized. Login again."); logout(); return; }

    if (whatsappNumber) {
      const message = `Hello! Your Free Fire Scrim registration has been ${status}.`;
      const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }

    loadRegistrations(); // refresh table
  } catch(err) { console.error("Admin action failed:", err); }
}

/* ===============================
   INIT
================================ */
loadRegistrations();
loadLastReset();
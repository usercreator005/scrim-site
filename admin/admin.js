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

/* ===============================
   LOAD LAST RESET
================================ */
async function loadLastReset() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lastReset`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    const data = await res.json();
    document.getElementById("lastReset").innerText = data.lastReset || "Never";
  } catch (err) {
    console.error(err);
    document.getElementById("lastReset").innerText = "Error";
  }
}

async function manualReset() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/manualReset`, {
      method: "POST",
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    const data = await res.json();
    alert(data.message);
    loadLastReset();
    loadRegistrations();
  } catch (err) {
    console.error(err);
    alert("Reset failed");
  }
}

/* ===============================
   LOAD REGISTRATIONS + LOBBY LOGIC
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

    /* 🔹 STEP 1: Only Accepted Teams */
    const accepted = data.filter(r => r.status === "Accepted");

    /* 🔹 STEP 2: Group by Time + Fee */
    const groups = {};
    accepted.forEach(r => {
      const key = `${r.time}_${r.fee}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    /* 🔹 STEP 3: Render Lobby Wise */
    Object.keys(groups).forEach(key => {
      const teams = groups[key];
      const [time, fee] = key.split("_");

      teams.forEach((team, index) => {
        // 🟡 Every 12 teams = new lobby
        if (index % 12 === 0) {
          const lobbyNo = Math.floor(index / 12) + 1;

          const lobbyRow = document.createElement("tr");
          lobbyRow.innerHTML = `
            <td colspan="7" style="
              background:#222;
              color:#ffcc00;
              font-weight:bold;
              text-align:center;
            ">
              Lobby No: ${lobbyNo} | Time: ${time} | Fee: ₹${fee}
            </td>
          `;
          tbody.appendChild(lobbyRow);
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${team.teamName}</td>
          <td>${team.whatsapp}</td>
          <td>${team.time}</td>
          <td>${team.fee}</td>
          <td>
            <a href="${BACKEND_URL}/uploads/${team.screenshot}" target="_blank">
              View
            </a>
          </td>
          <td class="status-accepted">Accepted</td>
          <td>—</td>
        `;
        tbody.appendChild(tr);
      });
    });

  } catch (err) {
    console.error("Error loading registrations:", err);
  }
}

/* ===============================
   ADMIN ACTION (Accept / Reject)
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
      alert("Unauthorized. Login again.");
      logout();
      return;
    }

    // 📲 WhatsApp message
    if (whatsappNumber) {
      const message = `Hello! Your Free Fire Scrim registration has been ${status}.`;
      const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }

    loadRegistrations();
  } catch (err) {
    console.error("Admin action failed:", err);
  }
}

/* ===============================
   INIT
================================ */
loadRegistrations();
loadLastReset();
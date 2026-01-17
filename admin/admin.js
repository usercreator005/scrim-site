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

async function saveLobbyConfig() {
  const time = document.getElementById("lobbyTime").value;
  const fee = document.getElementById("lobbyFee").value;
  const lobbyNo = document.getElementById("lobbyNumber").value;
  const maxTeams = document.getElementById("maxTeams").value;
  const whatsappLink = document.getElementById("whatsappLink").value;

  if (!time || !fee || !lobbyNo || !maxTeams) {
    alert("Please fill all lobby fields");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbyConfig`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({
        time,
        fee,
        lobbyNo,
        maxTeams,
        whatsappLink
      })
    });

    const data = await res.json();
    alert(data.message || "Lobby saved");

  } catch (err) {
    console.error(err);
    alert("Failed to save lobby");
  }
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

    /* ===============================
       1️⃣ PENDING REGISTRATIONS (FULL)
    =============================== */
    const pending = data.filter(r => r.status === "pending");

    pending.forEach(reg => {
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
        <td class="status-pending">pending</td>
        <td>
          <button class="accept"
            onclick="adminAction(
  '${reg._id}',
  'accepted',
  '${reg.whatsapp}',
  '${reg.time}',
  '${reg.fee}'
)">
            Accept
          </button>
          <button class="reject"
            onclick="adminAction(
  '${reg._id}',
  'rejected',
  '${reg.whatsapp}'
)">
            Reject
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    /* ===============================
       2️⃣ ACCEPTED → SIMPLE LOBBY VIEW
    =============================== */
    const accepted = data.filter(r => r.status === "accepted");

    // Group by time + fee
    const groups = {};
    accepted.forEach(r => {
      const key = `${r.time}_${r.fee}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.keys(groups).forEach(key => {
      const teams = groups[key];
      const [time, fee] = key.split("_");

      teams.forEach((team, index) => {

        // Every 12 teams = new lobby heading
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

        // Team row (ONLY Sr.No + Team Name)
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td colspan="2">${(index % 12) + 1}</td>
          <td colspan="5">${team.teamName}</td>
        `;
        tbody.appendChild(tr);
      });
    });

  } catch (err) {
    console.error("Admin load error:", err);
  }
}

/* ===============================
   ADMIN ACTION (Accept / Reject)
================================ */
async function adminAction(id, status, whatsappNumber, time = "", fee = "") {
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
    if (status === "accepted" && whatsappNumber) {
  const message =
`Hello! Your Free Fire Scrim registration has been ACCEPTED ✅

🕒 Time: ${time}
💰 Fee: ₹${fee}

Please join lobby on time.
All the best!`;

  const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

    loadRegistrations();
  } catch (err) {
    console.error("Admin action failed:", err);
  }
}
async function loadLobbies() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbies`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });

    const lobbies = await res.json();
    const tbody = document.getElementById("lobbyTable");
    tbody.innerHTML = "";

    lobbies.forEach(lobby => {
      const remaining = lobby.maxTeams - lobby.currentTeams;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${lobby.time}</td>
        <td>₹${lobby.fee}</td>
        <td>${lobby.lobbyNo}</td>
        <td>${lobby.maxTeams}</td>
        <td>${lobby.currentTeams}</td>
        <td style="color:${remaining === 0 ? 'red' : 'lightgreen'}">
          ${remaining}
        </td>
        <td>
          <a href="${lobby.whatsappGroupLink}" target="_blank">
            Open
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Load lobbies failed", err);
  }
}

async function createLobby() {
  const time = document.getElementById("lobbyTime").value;
  const fee = Number(document.getElementById("lobbyFee").value);
  const lobbyNo = Number(document.getElementById("lobbyNo").value);
  const maxTeams = Number(document.getElementById("maxTeams").value);
  const whatsappGroupLink = document.getElementById("wpLink").value;

  if (!time || !fee || !lobbyNo || !whatsappGroupLink) {
    alert("All fields required");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/createLobby`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({
        time,
        fee,
        lobbyNo,
        maxTeams,
        whatsappGroupLink
      })
    });

    const data = await res.json();
    alert(data.message || "Lobby created");

  } catch (err) {
    console.error(err);
    alert("Failed to create lobby");
  }
}

/* ===============================
   INIT
================================ */
loadRegistrations();
loadLastReset();
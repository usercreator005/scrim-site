const BACKEND_URL = "https://scrim-backend.onrender.com";
const ADMIN_TOKEN = localStorage.getItem("adminToken");
const TOTAL_SLOTS = lobby.maxLobby * 12;
const remaining = TOTAL_SLOTS - lobby.currentTeams;
if (!ADMIN_TOKEN) {
  alert("Session expired. Please login again.");
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/* ===============================
   LOBBY CONFIGURATION FUNCTIONS
================================ */
async function saveLobbyConfig() {
  const time = document.getElementById("lobbyTime").value;
  const fee = Number(document.getElementById("lobbyFee").value);
  const lobbyNo = Number(document.getElementById("lobbyNumber").value);
  const maxLobby = Number(document.getElementById("maxLobby").value);
  const whatsappLink = document.getElementById("whatsappLink").value;

  if (!time || !fee || !lobbyNo || !maxLobby) {
    alert("Please fill all lobby fields");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({ time, fee, lobbyNo, maxLobby, whatsappLink })
    });

    const data = await res.json();
    alert(data.message || "Lobby saved");
    loadLobbies();
  } catch (err) {
    console.error(err);
    alert("Failed to save lobby");
  }
}

async function loadLobbyLimits() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    const data = await res.json();
    const container = document.getElementById("lobbyLimitsContainer");
    container.innerHTML = "";

    data.forEach(limit => {
      const div = document.createElement("div");
      div.innerHTML = `
        Time: ${limit.time} | Fee: ₹${limit.fee} 
        | Max Lobby: <input type="number" value="${limit.maxLobby}" min="1" 
          onchange="updateLobbyLimit('${limit._id}', this.value)">
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Load lobby limits failed:", err);
  }
}

async function updateLobbyLimit(id, value) {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({ _id: id, maxLobby: Number(value) })
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error("Update lobby limit failed:", err);
  }
}

async function saveLobbyLink() {
  const select = document.getElementById("lobbyTimeFeeSelect");
  const link = document.getElementById("lobbyLinkInput").value.trim();

  if (!select.value || !link) {
    alert("Select lobby and enter link");
    return;
  }

  const [time, fee] = select.value.split("_");

  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbyLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({ time, fee, link })
    });
    const data = await res.json();
    document.getElementById("lobbyLinkStatus").innerText = data.message;
    loadRegistrations(); // Refresh registrations table
    loadLobbies();       // Refresh lobby table
  } catch (err) {
    console.error(err);
    alert("Failed to save link");
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
      const remaining = lobby.maxLobby - lobby.currentTeams;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${lobby.time}</td>
        <td>₹${lobby.fee}</td>
        <td>${lobby.lobbyNo}</td>
        <td>${lobby.maxLobby}</td>
        <td>${lobby.currentTeams}</td>
        <td>${lobby.maxLobby} Lobbies</td>
<td>${lobby.currentTeams}</td>
<td>${remaining}</td>
        <td style="color:${remaining === 0 ? 'red' : 'lightgreen'}">${remaining}</td>
        <td>
          <a href="${lobby.whatsappGroupLink || '#'}" target="_blank">
            ${lobby.whatsappGroupLink ? 'Open' : 'N/A'}
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Load lobbies failed", err);
  }
}

/* ===============================
   LAST RESET
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
    loadLobbies();
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

    // PENDING REGISTRATIONS
    const pending = data.filter(r => r.status === "pending");
    pending.forEach(reg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.teamName}</td>
        <td>${reg.whatsapp}</td>
        <td>${reg.time}</td>
        <td>${reg.fee}</td>
        <td>
          <a href="${BACKEND_URL}/uploads/${reg.screenshot}" target="_blank">View</a>
        </td>
        <td class="status-pending">pending</td>
        <td>
          <button class="accept" onclick="adminAction('${reg._id}','accepted','${reg.whatsapp}','${reg.time}','${reg.fee}')">Accept</button>
          <button class="reject" onclick="adminAction('${reg._id}','rejected','${reg.whatsapp}')">Reject</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // ACCEPTED → LOBBY VIEW
    const accepted = data.filter(r => r.status === "accepted");
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
        if (index % 12 === 0) {
          const lobbyNo = Math.floor(index / 12) + 1;
          const lobbyRow = document.createElement("tr");
          lobbyRow.innerHTML = `<td colspan="7" style="background:#222;color:#ffcc00;font-weight:bold;text-align:center;">Lobby No: ${lobbyNo} | Time: ${time} | Fee: ₹${fee}</td>`;
          tbody.appendChild(lobbyRow);
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="2">${(index % 12) + 1}</td><td colspan="5">${team.teamName}</td>`;
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

    // WhatsApp message for accepted teams
    if (status === "accepted" && whatsappNumber) {
      // Fetch latest team info to get lobby link
      const registrations = await fetch(`${BACKEND_URL}/adminRegs`, { headers: { "x-admin-token": ADMIN_TOKEN } });
      const data = await registrations.json();
      const team = data.find(r => r._id === id);

      let message = `Hello! Your Free Fire Scrim registration has been ACCEPTED ✅\n🕒 Time: ${time}\n💰 Fee: ₹${fee}`;
      if (team && team.lobbyLink) {
        message += `\nJoin Lobby: ${team.lobbyLink}`;
      }

      const url = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }

    loadRegistrations();
    loadLobbies();

  } catch (err) {
    console.error("Admin action failed:", err);
  }
}

/* ===============================
   INIT
================================ */
loadRegistrations();
loadLobbyLimits();
loadLastReset();
loadLobbies();
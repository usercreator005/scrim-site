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
   LOBBY CONFIGURATION
================================ */
async function saveLobbyConfig() {
  const time = document.getElementById("lobbyTime").value;
  const fee = Number(document.getElementById("lobbyFee").value);
  const lobbyNo = Number(document.getElementById("lobbyNumber").value);
  const maxLobby = Number(document.getElementById("maxLobby").value);

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
      body: JSON.stringify({ time, fee, lobbyNo, maxLobby })
    });

    const data = await res.json();
    alert(data.message || "Lobby saved");

    loadLobbies();
    loadLobbyLimits();
    loadLobbyTimeFeeOptions();

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

    const json = await res.json();
    const limits = Array.isArray(json) ? json : json.data || [];

    const container = document.getElementById("lobbyLimitsContainer");
    container.innerHTML = "";

    limits.forEach(limit => {
      const div = document.createElement("div");
      div.style.marginBottom = "8px";
      div.innerHTML = `
        <b>${limit.time}</b> | ₹${limit.fee}
        | Max Lobbies:
        <input type="number" value="${limit.maxLobby}" min="1"
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
    alert(data.message || "Updated");

    loadLobbies();
    loadLobbyTimeFeeOptions();

  } catch (err) {
    console.error("Update lobby limit failed:", err);
  }
}

/* ===============================
   LOBBY LINK
================================ */
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
    document.getElementById("lobbyLinkStatus").innerText = data.message || "Saved";

    loadRegistrations();
    loadLobbies();

  } catch (err) {
    console.error(err);
    alert("Failed to save link");
  }
}

/* ===============================
   LOBBY STATUS TABLE
================================ */
async function loadLobbies() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbies`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });

    const json = await res.json();
    const lobbies = Array.isArray(json) ? json : [];

    const tbody = document.getElementById("lobbyTable");
    tbody.innerHTML = "";

    lobbies.forEach(lobby => {
      const TOTAL = lobby.maxLobby * 12;
      const remaining = TOTAL - lobby.currentTeams;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${lobby.time}</td>
        <td>₹${lobby.fee}</td>
        <td>${lobby.lobbyNo}</td>
        <td>${lobby.maxLobby}</td>
        <td>${lobby.currentTeams}</td>
        <td style="color:${remaining <= 0 ? 'red' : 'lightgreen'}">
          ${remaining <= 0 ? "FULL" : remaining}
        </td>
        <td>
          ${lobby.whatsappGroupLink
            ? `<a href="${lobby.whatsappGroupLink}" target="_blank">Open</a>`
            : "N/A"}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Load lobbies failed", err);
  }
}

/* ===============================
   REGISTRATIONS
================================ */
async function loadRegistrations() {
  try {
    const res = await fetch(`${BACKEND_URL}/adminRegs`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });

    if (res.status === 401) {
      alert("Unauthorized");
      logout();
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("adminTable");
    tbody.innerHTML = "";

    const pending = data.filter(r => r.status === "pending");
    const accepted = data.filter(r => r.status === "accepted");

    pending.forEach(reg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${reg.teamName}</td>
        <td>${reg.whatsapp}</td>
        <td>${reg.time}</td>
        <td>${reg.fee}</td>
        <td><a href="${BACKEND_URL}/uploads/${reg.screenshot}" target="_blank">View</a></td>
        <td>Pending</td>
        <td>
          <button onclick="adminAction('${reg._id}','accepted','${reg.whatsapp}')">Accept</button>
          <button onclick="adminAction('${reg._id}','rejected','${reg.whatsapp}')">Reject</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const groups = {};
    accepted.forEach(r => {
      const key = `${r.time}_${r.fee}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.keys(groups).forEach(key => {
      const [time, fee] = key.split("_");
      groups[key].forEach((team, i) => {

        if (i % 12 === 0) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td colspan="7" style="background:#222;color:#ffcc00;font-weight:bold">
              Lobby ${Math.floor(i / 12) + 1} | ${time} | ₹${fee}
            </td>`;
          tbody.appendChild(row);
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="7">${(i % 12) + 1}. ${team.teamName}</td>`;
        tbody.appendChild(tr);
      });
    });

  } catch (err) {
    console.error("Admin load error:", err);
  }
}

/* ===============================
   ADMIN ACTION
================================ */
async function adminAction(id, status, whatsapp) {
  try {
    await fetch(`${BACKEND_URL}/adminAction/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({ status })
    });

    loadRegistrations();
    loadLobbies();

  } catch (err) {
    console.error("Admin action failed:", err);
  }
}

/* ===============================
   DROPDOWN OPTIONS
================================ */
async function loadLobbyTimeFeeOptions() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbies`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });

    const lobbies = await res.json();
    const select = document.getElementById("lobbyTimeFeeSelect");

    select.innerHTML = `<option value="">Select Time & Fee</option>`;
    const added = new Set();

    lobbies.forEach(lobby => {
      const key = `${lobby.time}_${lobby.fee}`;
      if (added.has(key)) return;
      added.add(key);

      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = `${lobby.time} | ₹${lobby.fee}`;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Failed to load lobby select", err);
  }
}
/* ===============================
   LAST RESET
================================ */
async function loadLastReset() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lastReset`, {
      headers: {
        "x-admin-token": ADMIN_TOKEN
      }
    });

    const data = await res.json();
    document.getElementById("lastReset").innerText =
      data?.lastReset || "Never";

  } catch (err) {
    console.error("Load last reset failed:", err);
    document.getElementById("lastReset").innerText = "Error";
  }
}

async function manualReset() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/manualReset`, {
      method: "POST",
      headers: {
        "x-admin-token": ADMIN_TOKEN
      }
    });

    const data = await res.json();
    alert(data.message || "Reset done");

    loadLastReset();
    loadRegistrations();
    loadLobbies();

  } catch (err) {
    console.error("Manual reset failed:", err);
    alert("Reset failed");
  }
}
/* ===============================
   INIT
================================ */
loadRegistrations();
loadLobbies();
loadLastReset();
loadLobbyLimits();
loadLobbyTimeFeeOptions();
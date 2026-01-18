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
   SAVE / UPDATE LOBBY LIMIT
   (time + fee based only)
================================ */
async function saveLobbyConfig() {
  const time = document.getElementById("lobbyTime").value;
  const fee = Number(document.getElementById("lobbyFee").value);
  const maxLobby = Number(document.getElementById("maxLobby").value);

  if (!time || !fee || !maxLobby) {
    alert("Fill all fields");
    return;
  }

  const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": ADMIN_TOKEN
    },
    body: JSON.stringify({ time, fee, maxLobby })
  });

  const data = await res.json();
  alert(data.message || "Saved");
  loadAll();
}

/* ===============================
   LOAD LOBBY STATUS
================================ */
async function loadLobbies() {
  const res = await fetch(`${BACKEND_URL}/admin/lobbies`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });

  const lobbies = await res.json();
  const tbody = document.getElementById("lobbyTable");
  tbody.innerHTML = "";

  lobbies.forEach(lobby => {
    tbody.innerHTML += `
      <tr>
        <td>${lobby.time}</td>
        <td>₹${lobby.fee}</td>
        <td>${lobby.lobbyNo || "-"}</td>
        <td>${lobby.maxLobby || "-"}</td>
        <td>${lobby.currentTeams || 0}</td>
        <td>${lobby.remainingTeams ?? "-"}</td>
        <td>
          ${lobby.whatsappGroupLink
            ? `<a href="${lobby.whatsappGroupLink}" target="_blank">Open</a>`
            : "N/A"}
        </td>
      </tr>
    `;
  });
}

/* ===============================
   REGISTRATIONS
================================ */
async function loadRegistrations() {
  const res = await fetch(`${BACKEND_URL}/adminRegs`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });

  const data = await res.json();
  const tbody = document.getElementById("adminTable");
  tbody.innerHTML = "";

  const pending = data.filter(r => r.status === "pending");
  const accepted = data.filter(r => r.status === "accepted");

  // Pending
  pending.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.teamName}</td>
        <td>${r.whatsapp}</td>
        <td>${r.time}</td>
        <td>₹${r.fee}</td>
        <td>
          <a href="${BACKEND_URL}/uploads/${r.screenshot}" target="_blank">View</a>
        </td>
        <td>Pending</td>
        <td>
          <button class="accept" onclick="adminAction('${r._id}','accepted','${r.whatsapp}')">Accept</button>
          <button class="reject" onclick="adminAction('${r._id}','rejected','${r.whatsapp}')">Reject</button>
        </td>
      </tr>
    `;
  });

  // Accepted grouped lobby-wise
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
        tbody.innerHTML += `
          <tr class="lobby-header">
            <td colspan="7">
              Lobby ${Math.floor(i / 12) + 1} | ${time} | ₹${fee}
            </td>
          </tr>
        `;
      }

      tbody.innerHTML += `
        <tr>
          <td colspan="7">${(i % 12) + 1}. ${team.teamName}</td>
        </tr>
      `;
    });
  });
}

/* ===============================
   ACCEPT / REJECT + WHATSAPP
================================ */
async function adminAction(id, status, whatsapp) {
  await fetch(`${BACKEND_URL}/adminAction/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": ADMIN_TOKEN
    },
    body: JSON.stringify({ status })
  });

  if (status === "accepted") {
    const res = await fetch(`${BACKEND_URL}/adminRegs`, {
      headers: { "x-admin-token": ADMIN_TOKEN }
    });
    const regs = await res.json();
    const team = regs.find(r => r._id === id);

    let msg =
`🎮 SCRIM ACCEPTED ✅
Team: ${team.teamName}
Time: ${team.time}
Fee: ₹${team.fee}`;

    if (team.whatsappGroupLink) {
  msg += `\n\n📲 WhatsApp Lobby Link:\n${team.whatsappGroupLink}`;
}
    window.open(
      `https://wa.me/91${whatsapp}?text=${encodeURIComponent(msg)}`
    );
  }

  loadAll();
}

/* ===============================
   LOBBY LIMIT LIST
================================ */
async function loadLobbyLimits() {
  const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });

  const limits = await res.json();
  const container = document.getElementById("lobbyLimitsContainer");
  container.innerHTML = "";

  limits.forEach(limit => {
    container.innerHTML += `
      <div style="margin-bottom:8px">
        <b>${limit.time}</b> | ₹${limit.fee}
        | Max Lobbies:
        <input type="number" value="${limit.maxLobby}" min="1"
          onchange="updateLobbyLimit('${limit._id}', this.value)">
      </div>
    `;
  });
}

async function updateLobbyLimit(id, value) {
  await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": ADMIN_TOKEN
    },
    body: JSON.stringify({ _id: id, maxLobby: Number(value) })
  });

  loadAll();
}

/* ===============================
   LOBBY LINK
================================ */
async function loadLobbyTimeFeeOptions() {
  const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });

  const limits = await res.json();
  const select = document.getElementById("lobbyTimeFeeSelect");
  select.innerHTML = `<option value="">Select Time & Fee</option>`;

  limits.forEach(l => {
    select.innerHTML += `
      <option value="${l.time}_${l.fee}">
        ${l.time} | ₹${l.fee}
      </option>
    `;
  });
}

async function saveLobbyLink() {
  const select = document.getElementById("lobbyTimeFeeSelect");
  const link = document.getElementById("lobbyLinkInput").value.trim();

  if (!select.value || !link) {
    alert("Select lobby & paste link");
    return;
  }

  const [time, fee] = select.value.split("_");

  await fetch(`${BACKEND_URL}/admin/lobbyLink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": ADMIN_TOKEN
    },
    body: JSON.stringify({ time, fee, link })
  });

  alert("Lobby link saved");
  loadAll();
}

/* ===============================
   RESET
================================ */
async function loadLastReset() {
  const res = await fetch(`${BACKEND_URL}/admin/lastReset`, {
    headers: { "x-admin-token": ADMIN_TOKEN }
  });
  const data = await res.json();
  document.getElementById("lastReset").innerText = data.lastReset || "Never";
}

async function manualReset() {
  await fetch(`${BACKEND_URL}/admin/manualReset`, {
    method: "POST",
    headers: { "x-admin-token": ADMIN_TOKEN }
  });
  alert("Reset done");
  loadAll();
}

/* ===============================
   INIT
================================ */
function loadAll() {
  loadRegistrations();
  loadLobbies();
  loadLobbyLimits();
  loadLobbyTimeFeeOptions();
  loadLastReset();
}

loadAll();
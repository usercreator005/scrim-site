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
   SAVE LOBBY SETTINGS (FIXED)
================================ */
async function saveLobbyConfig() {
  const time = document.getElementById("lobbyTime").value;
  const fee = Number(document.getElementById("lobbyFee").value);
  const lobbyNo = Number(document.getElementById("lobbyNumber").value);
  const maxLobby = Number(document.getElementById("maxTeams").value);
  const lobbyLink = document.getElementById("whatsappLink").value.trim();

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
      body: JSON.stringify({
        time,
        fee,
        maxLobby,
        lobbyLink
      })
    });

    const data = await res.json();
    alert(data.message || "Lobby saved successfully");
    loadLobbyLimits();
    loadLobbies();

  } catch (err) {
    console.error(err);
    alert("Failed to save lobby");
  }
}

/* ===============================
   LOAD LOBBY LIMITS
================================ */
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
      div.style.marginBottom = "8px";
      div.innerHTML = `
        🕒 ${limit.time} | 💰 ₹${limit.fee} |
        Max Teams:
        <input type="number" value="${limit.maxLobby}" min="1"
          onchange="updateLobbyLimit('${limit.time}','${limit.fee}',this.value)">
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Load lobby limits failed:", err);
  }
}

async function updateLobbyLimit(time, fee, value) {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/lobbyLimits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN
      },
      body: JSON.stringify({
        time,
        fee,
        maxLobby: Number(value)
      })
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error("Update lobby limit failed:", err);
  }
}

/* ===============================
   SAVE LOBBY LINK
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
    document.getElementById("lobbyLinkStatus").innerText = data.message;
    loadRegistrations();
    loadLobbies();

  } catch (err) {
    console.error(err);
    alert("Failed to save link");
  }
}

/* ===============================
   LOAD LOBBIES
================================ */
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
   INIT
================================ */
loadRegistrations();
loadLobbyLimits();
loadLastReset();
loadLobbies();
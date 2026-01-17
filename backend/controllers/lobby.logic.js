const Lobby = require("../models/Lobby");

/* Find lobby and check space */
async function assignLobby(time, fee) {
  const lobby = await Lobby.findOne({ time, fee })
    .sort({ lobbyNo: 1 });

  if (!lobby) return { error: "Lobby not found" };

  if (lobby.currentTeams >= lobby.maxTeams) {
    return { error: "Lobby is full" };
  }

  lobby.currentTeams += 1;
  await lobby.save();

  return { lobby };
}

module.exports = { assignLobby };
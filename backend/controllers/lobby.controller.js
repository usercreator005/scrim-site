const Lobby = require("../models/Lobby");

exports.getAllLobbies = async (req, res) => {
  const lobbies = await Lobby.find().sort({ time: 1, lobbyNo: 1 });
  res.json(lobbies);
};
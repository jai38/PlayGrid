import { useEffect, useState } from "react";
import {
  connectSocket,
  createRoom,
  getRooms,
  joinRoom,
  onErrorMessage,
  onRoomJoined,
  onRoomsUpdate,
} from "../services/socket";

export default function Lobby() {
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("playerName") || "",
  );
  const [roomId, setRoomId] = useState(localStorage.getItem("roomId") || "");
  const [rooms, setRooms] = useState<any[]>([]);
  const [error, setError] = useState("");

  // New states
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const s = connectSocket(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:4000",
    );
    getRooms(setRooms);
    onRoomsUpdate(setRooms);
    onRoomJoined((data) => {
      setRoomId(data.roomId);
      localStorage.setItem("roomId", data.room.roomId);
      localStorage.setItem("currentPlayer", JSON.stringify(data.player));
      localStorage.setItem("currentRoom", JSON.stringify(data.room));
    });
    onErrorMessage(setError);
    return () => {
      s.off("roomsUpdate");
      s.off("roomJoined");
      s.off("playersUpdate");
      s.off("errorMessage");
    };
  }, []);

  const handleCreate = () => {
    if (playerName.trim() && roomName.trim()) {
      localStorage.setItem("playerName", playerName);
      createRoom(playerName, roomName, isPrivate, password || undefined);
    } else {
      setError("Please enter a valid gamer tag and room name.");
    }
  };

  const handleDirectJoin = (room: any) => {
    if (playerName.trim()) {
      setRoomId(room.roomId);
      const alreadyJoined = localStorage.getItem("roomId") === roomId;
      if (!alreadyJoined) {
        joinRoom(
          room.roomId,
          playerName,
          room.isPrivate ? prompt("Enter password:") : undefined,
        );
      }
    } else {
      setError("Please enter a valid gamer tag.");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("currentRoom")) {
      window.location.href = `/room/${localStorage.getItem("roomId")}`;
    }
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-4 flex flex-col">
      <h2 className="text-3xl font-extrabold text-center mb-6 tracking-wide drop-shadow-lg">
        🎮 Game Lobby
      </h2>

      {error && (
        <div className="bg-red-500/80 rounded p-2 text-center text-sm mb-3">
          {error}
        </div>
      )}

      {/* Player Name */}
      <input
        type="text"
        placeholder="Enter your gamer tag"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      {/* Create Room Section */}
      <div className="bg-white/5 p-4 rounded-lg shadow-lg mb-6">
        <h3 className="font-bold text-lg mb-3">🛠 Create a Room</h3>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="bg-white/10 border border-white/20 p-3 rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="accent-purple-500 w-5 h-5 mr-2"
          />
          <label className="text-sm">Private Room</label>
        </div>

        {isPrivate && (
          <input
            type="password"
            placeholder="Room Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/10 border border-white/20 p-3 rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        )}

        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all duration-200 text-white px-4 py-3 rounded-lg w-full font-semibold shadow-lg active:scale-95">
          🚀 Create Room
        </button>
      </div>

      {/* Available Rooms */}
      {rooms.length > 0 && (
        <div className="bg-white/5 p-4 rounded-lg shadow-lg flex-1 overflow-y-auto">
          <h3 className="font-bold text-lg mb-3">📜 Available Rooms</h3>
          <ul className="space-y-3">
            {rooms.map((room) => (
              <li
                key={room.roomId}
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 transition-all p-3 rounded-lg shadow">
                <span className="text-sm">
                  <span className="font-bold">{room.name}</span>{" "}
                  <span className="opacity-75">
                    ({room.players?.length}/{room.maxPlayers})
                  </span>
                  {room.isPrivate && " 🔒"}
                </span>
                <button
                  onClick={() => handleDirectJoin(room)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 transition-all px-3 py-1.5 rounded-lg text-xs font-semibold shadow active:scale-95">
                  Join
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useSocket } from "../hooks/useSocket";

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(
    JSON.parse(localStorage.getItem("currentPlayer")) || "",
  );
  const [room, setRoom] = useState(
    JSON.parse(localStorage.getItem("currentRoom")),
  );
  const [error, setError] = useState("");

  // Set up socket events once
  const setupEvents = useCallback((socket: Socket) => {
    socket.on("players:update", (data: any) => {
      if (data.roomId === roomId) {
        setPlayers(data?.players);
      }
    });

    socket.on("room:joined", ({ room, player }) => {
      localStorage.setItem("roomId", room.roomId);
      localStorage.setItem("currentPlayer", JSON.stringify(player));
      localStorage.setItem("currentRoom", JSON.stringify(room));
      setCurrentPlayer(player);
      setRoom(room);
      setPlayers([...players, room.player]);
    });
    socket.on("rooms:update", (rooms) => {
      rooms.forEach((room: any) => {
        if (room.roomId === roomId) {
          localStorage.setItem("currentRoom", JSON.stringify(room));
          setPlayers(room.players);
        }
      });
    });

    socket.on("errorMessage", (msg) => {
      setError(msg);
    });
  }, []);

  const socket = useSocket(setupEvents);

  // Join room when socket is ready
  useEffect(() => {
    if (socket && roomId) {
      const savedName = localStorage.getItem("playerName") || "Guest";
      const alreadyJoined = localStorage.getItem("roomId") === roomId;

      if (!alreadyJoined) {
        socket.emit(
          "joinRoom",
          { roomId, playerName: savedName },
          (res: any) => {
            if (res.success) {
              localStorage.setItem("roomId", roomId);
            } else {
              setError(res.error || "Failed to join room");
            }
          },
        );
      }
    }
  }, [socket, roomId]);

  const handleLeave = () => {
    if (socket && roomId) {
      localStorage.removeItem("currentRoom");
      localStorage.removeItem("roomId");
      socket.emit("leaveRoom", { roomId, playerId: currentPlayer.playerId });
      navigate("/lobby"); // back to lobby
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-b from-indigo-900 via-purple-900 to-black shadow-xl p-6 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">
        Room: <span className="text-purple-400">{room.name || roomId}</span>
      </h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <h3 className="text-lg font-semibold mb-2">Players</h3>
      <ul className="space-y-2">
        {players?.map((p: any, i) => (
          <li
            key={i}
            className={`flex items-center justify-between p-2 rounded-lg ${
              p.isHost ? "bg-purple-800" : "bg-gray-700"
            }`}>
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 w-8 h-8 flex items-center justify-center rounded-full font-bold text-white">
                {p.name.charAt(0).toUpperCase()}
              </span>
              {p.isHost && <span className="text-yellow-300">⭐</span>}
              <span className="font-medium">{p.name}</span>
            </div>

            {p.isHost && (
              <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">
                Host
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* If current player is host, show extra controls */}
      {players?.find((pl: any) => pl.playerId === currentPlayer.playerId)
        ?.isHost && (
        <div className="mt-6 space-y-2">
          <button className="w-full bg-green-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-green-400 active:scale-95 transition">
            Start Game
          </button>
          {/* <button className="w-full bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 active:scale-95 transition">
            Kick Player
          </button> */}
        </div>
      )}

      {/* Leave Room button */}
      <button
        onClick={handleLeave}
        className="mt-6 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 active:scale-95 transition">
        Leave Room
      </button>
    </div>
  );
}

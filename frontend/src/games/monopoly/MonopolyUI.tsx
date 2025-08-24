// src/games/monopoly/MonopolyUI.tsx
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useSocket } from "../../hooks/useSocket";

interface MonopolyPlayer {
  playerId: string;
  name: string;
  position: number;
  money: number;
  properties: number[];
  houses: Record<number, number>;
  hotels: number[];
  jailTurns: number;
  getOutOfJailCards: number;
  bankrupt: boolean;
}

interface MonopolyGameState {
  players: MonopolyPlayer[];
  currentTurnPlayerId: string;
  board: any[];
  dice: [number, number];
  doublesCount: number;
  gamePhase: "WAITING" | "PLAYING" | "GAME_OVER";
  bank: {
    houses: number;
    hotels: number;
    money: number;
  };
  logs: string[];
}

// Memoized player component for better performance
const PlayerCard = memo(
  ({
    player,
    index,
    isCurrentPlayer,
    isMyTurn,
  }: {
    player: MonopolyPlayer;
    index: number;
    isCurrentPlayer: boolean;
    isMyTurn: boolean;
  }) => (
    <div
      className={`p-3 rounded ${
        isCurrentPlayer ? "bg-blue-600 border-2 border-blue-400" : "bg-gray-700"
      } ${player.bankrupt ? "opacity-50" : ""}`}>
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {player.name}
          {isCurrentPlayer && " 🎲"}
        </span>
        <span className="text-green-400">💰 ${player.money}</span>
      </div>
      <div className="text-sm text-gray-300 mt-1">
        Position: {player.position} | Properties: {player.properties.length}
        {player.jailTurns > 0 && ` | Jail: ${player.jailTurns} turns`}
      </div>
    </div>
  ),
);

// Memoized action buttons component
const ActionButtons = memo(
  ({
    isMyTurn,
    onRollDice,
    onEndTurn,
  }: {
    isMyTurn: boolean;
    onRollDice: () => void;
    onEndTurn: () => void;
  }) => (
    <div className="space-y-2">
      {isMyTurn && (
        <>
          <button
            onClick={onRollDice}
            className="w-full bg-green-500 hover:bg-green-400 p-3 rounded font-medium transition-colors">
            Roll Dice
          </button>
          <button
            onClick={onEndTurn}
            className="w-full bg-blue-500 hover:bg-blue-400 p-3 rounded font-medium transition-colors">
            End Turn
          </button>
        </>
      )}
    </div>
  ),
);

export default function MonopolyUI() {
  const { roomId } = useParams<{ roomId: string }>();
  const [state, setState] = useState<MonopolyGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(
    JSON.parse(localStorage.getItem("currentPlayer") || "{}"),
  );
  const [error, setError] = useState("");

  const setupEvents = useCallback((socket: Socket) => {
    socket.on("game:state", (gameState: MonopolyGameState) => {
      setState(gameState);
    });

    socket.on("errorMessage", (msg) => {
      setError(msg);
    });
  }, []);

  const socket = useSocket(setupEvents);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit("game:join", { roomId, gameId: "monopoly" });
    }
  }, [socket, roomId]);

  // Memoize action handlers to prevent unnecessary re-renders
  const handleRollDice = useCallback(() => {
    if (!socket || !state) return;
    socket.emit("game:action", {
      roomId,
      gameId: "monopoly",
      action: {
        type: "ROLL_DICE",
        playerId: currentPlayer.playerId,
      },
    });
  }, [socket, state, roomId, currentPlayer.playerId]);

  const handleEndTurn = useCallback(() => {
    if (!socket || !state) return;
    socket.emit("game:action", {
      roomId,
      gameId: "monopoly",
      action: {
        type: "END_TURN",
        playerId: currentPlayer.playerId,
      },
    });
  }, [socket, state, roomId, currentPlayer.playerId]);

  // Memoize computed values
  const currentPlayerData = useMemo(
    () => state?.players.find(p => p.playerId === state.currentTurnPlayerId),
    [state?.players, state?.currentTurnPlayerId],
  );

  const isMyTurn = useMemo(
    () => currentPlayerData?.playerId === currentPlayer.playerId,
    [currentPlayerData?.playerId, currentPlayer.playerId],
  );

  if (!state) {
    return (
      <div className="text-white p-6">
        <p>Loading Monopoly game...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-white bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Monopoly</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Players Section */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Players</h3>
          <div className="space-y-2">
            {state.players.map((player, index) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                index={index}
                isCurrentPlayer={player.playerId === state.currentTurnPlayerId}
                isMyTurn={isMyTurn}
              />
            ))}
          </div>
        </div>

        {/* Game Actions */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Game Actions</h3>
          <ActionButtons
            isMyTurn={isMyTurn}
            onRollDice={handleRollDice}
            onEndTurn={handleEndTurn}
          />

          {state.dice && (
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <p className="text-center">
                Dice: {state.dice[0]} + {state.dice[1]} = {state.dice[0] + state.dice[1]}
                {state.dice[0] === state.dice[1] && " (Doubles!)"}
              </p>
              {state.doublesCount > 0 && (
                <p className="text-center text-yellow-400 text-sm">
                  Doubles count: {state.doublesCount}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Logs */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Game Log</h3>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {state.logs.slice(-10).map((log, index) => (
            <p key={index} className="text-sm text-gray-300">
              {log}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

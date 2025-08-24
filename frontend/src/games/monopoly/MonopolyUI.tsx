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
  mortgagedProperties?: number[];
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
  gameLog?: Array<{
    timestamp: number;
    playerId?: string;
    playerName?: string;
    action: string;
    details?: any;
  }>;
  freeParkingPot?: number;
  gameRules?: {
    freeParkingCollectsWinnings: boolean;
  };
}

// Memoized player component for better performance
const PlayerCard = memo(
  ({
    player,
    isCurrentPlayer,
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
        {player.mortgagedProperties && player.mortgagedProperties.length > 0 && ` | Mortgaged: ${player.mortgagedProperties.length}`}
        {player.jailTurns > 0 && ` | Jail: ${player.jailTurns} turns`}
        {player.getOutOfJailCards > 0 && ` | 🗝️ ${player.getOutOfJailCards}`}
        {player.bankrupt && ` | 💀 BANKRUPT`}
      </div>
    </div>
  ),
);

// Memoized action buttons component
const ActionButtons = memo(
  ({
    isMyTurn,
    currentPlayer,
    onRollDice,
    onEndTurn,
    onPayJailFine,
    onUseJailCard,
  }: {
    isMyTurn: boolean;
    currentPlayer: MonopolyPlayer | undefined;
    onRollDice: () => void;
    onEndTurn: () => void;
    onPayJailFine: () => void;
    onUseJailCard: () => void;
  }) => (
    <div className="space-y-2">
      {isMyTurn && (
        <>
          {/* Jail Actions */}
          {currentPlayer && currentPlayer.jailTurns > 0 && (
            <div className="bg-red-900/30 p-3 rounded">
              <p className="text-yellow-400 text-sm mb-2">
                In Jail (Turn {currentPlayer.jailTurns}/3)
              </p>
              <div className="space-y-2">
                <button
                  onClick={onRollDice}
                  className="w-full bg-blue-500 hover:bg-blue-400 p-2 rounded text-sm transition-colors">
                  Roll for Doubles
                </button>
                {currentPlayer.money >= 50 && (
                  <button
                    onClick={onPayJailFine}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 p-2 rounded text-sm transition-colors">
                    Pay $50 Fine
                  </button>
                )}
                {currentPlayer.getOutOfJailCards > 0 && (
                  <button
                    onClick={onUseJailCard}
                    className="w-full bg-purple-500 hover:bg-purple-400 p-2 rounded text-sm transition-colors">
                    Use Get Out of Jail Free Card
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Normal Actions */}
          {currentPlayer && currentPlayer.jailTurns === 0 && (
            <button
              onClick={onRollDice}
              className="w-full bg-green-500 hover:bg-green-400 p-3 rounded font-medium transition-colors">
              Roll Dice
            </button>
          )}
          
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
  const [currentPlayer] = useState<any>(
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

  const handlePayJailFine = useCallback(() => {
    if (!socket || !state) return;
    socket.emit("game:action", {
      roomId,
      gameId: "monopoly",
      action: {
        type: "PAY_JAIL_FINE",
        playerId: currentPlayer.playerId,
      },
    });
  }, [socket, state, roomId, currentPlayer.playerId]);

  const handleUseJailCard = useCallback(() => {
    if (!socket || !state) return;
    socket.emit("game:action", {
      roomId,
      gameId: "monopoly",
      action: {
        type: "USE_JAIL_CARD",
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
            currentPlayer={currentPlayerData}
            onRollDice={handleRollDice}
            onEndTurn={handleEndTurn}
            onPayJailFine={handlePayJailFine}
            onUseJailCard={handleUseJailCard}
          />

          {/* Game Status Information */}
          <div className="mt-4 space-y-2">
            {/* Dice Display */}
            {state.dice && (
              <div className="p-3 bg-gray-700 rounded">
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

            {/* Free Parking Pot */}
            {state.freeParkingPot !== undefined && state.freeParkingPot > 0 && (
              <div className="p-3 bg-green-900/30 rounded">
                <p className="text-center text-green-400">
                  🅿️ Free Parking Pot: ${state.freeParkingPot}
                </p>
              </div>
            )}

            {/* Bank Inventory */}
            <div className="p-3 bg-gray-700 rounded">
              <p className="text-center text-sm">
                🏦 Bank: 🏠 {state.bank.houses} houses | 🏨 {state.bank.hotels} hotels
              </p>
            </div>
          </div>
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

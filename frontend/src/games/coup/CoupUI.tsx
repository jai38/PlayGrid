import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useSocket } from "../../hooks/useSocket";
import PlayerList from "./components/PlayerList";
import ActionButtons from "./components/ActionButtons";
import WinnerBanner from "./components/WinnerBanner";
import type { CoupGameState } from "./types";
import type { ActionPayload } from "./types";
import PendingActionPopup from "./components/PendingActionPopup";
import TargetSelector from "./components/TargetSelector";
import MyHand from "./components/MyHand";

export default function CoupUI() {
  const { roomId } = useParams<{ roomId: string }>();
  const [state, setState] = useState<CoupGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(
    JSON.parse(localStorage.getItem("currentPlayer") || "{}"),
  );
  const [error, setError] = useState("");
  const [showTargetModal, setTargetModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const setupEvents = useCallback((socket: Socket) => {
    socket.on("game:state", (gameState: CoupGameState) => {
      console.log("CoupUI: Received game state", gameState);
      setState(gameState);
    });

    socket.on("errorMessage", (msg) => {
      setError(msg);
    });
  }, []);

  const socket = useSocket(setupEvents);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit("game:join", { roomId, gameId: "coup" });
    }
  }, [socket, roomId]);

  const sendAction = (type: string, payload?: ActionPayload) => {
    if (!socket || !state) return;
    socket.emit("game:action", {
      roomId,
      gameId: "coup",
      action: {
        type,
        payload,
        playerId: currentPlayer.playerId,
      },
    });
    setTargetModal(false);
  };

  const isMyTurn = state?.currentTurnPlayerId === currentPlayer.playerId;

  return (
    <div className="max-w-2xl mx-auto p-6 text-white bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Coup</h2>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
      )}

      {state && (
        <>
          <PlayerList
            players={state.players}
            currentTurnPlayerId={state.currentTurnPlayerId}
          />
          {state.winner && (
            <div className="bg-green-700 p-3 rounded text-center font-bold">
              Winner:{" "}
              {state.players.find((p) => p.playerId === state.winner)?.name}
            </div>
          )}
          {state.players.find((p) => p.playerId === currentPlayer.playerId)
            ?.influence && (
            <MyHand
              cards={
                state.players.find((p) => p.playerId === currentPlayer.playerId)
                  ?.influence || ["Duke", "Assassin"]
              }
            />
          )}
          <ActionButtons
            isMyTurn={isMyTurn}
            sendAction={(type, payload) => {
              if (["COUP", "ASSASSINATE", "STEAL"].includes(type)) {
                setSelectedAction(type);
                setTargetModal(true);
              } else {
                sendAction(type, payload);
              }
            }}
            setTargetModal={(val) => {
              setSelectedAction(val ? selectedAction : null);
              setTargetModal(val);
            }}
          />
          {showTargetModal && selectedAction && (
            <TargetSelector
              players={state.players.filter(
                (p) => p.isAlive && p.playerId !== currentPlayer.playerId,
              )}
              onSelect={(targetId) => sendAction(selectedAction, { targetId })}
              onCancel={() => setTargetModal(false)}
            />
          )}
          {state.pendingAction && (
            <PendingActionPopup
              pendingAction={state.pendingAction}
              currentPlayerId={currentPlayer.playerId}
              onBlock={(role) =>
                sendAction("BLOCK", {
                  role,
                  targetId: state.pendingAction?.actorId,
                })
              }
              onChallenge={() => sendAction("CHALLENGE")}
            />
          )}
        </>
      )}
    </div>
  );
}

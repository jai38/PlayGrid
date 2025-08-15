// src/games/coup/components/PendingActionBanner.tsx
import React from "react";
import type { PendingAction, CoupPlayer } from "../types/coup.types";

interface PendingActionBannerProps {
  pendingAction: PendingAction;
  players: CoupPlayer[];
  currentPlayerId: string;
  onBlock: () => void;
  onChallenge: () => void;
  onResolve: () => void;
}

export const PendingActionBanner: React.FC<PendingActionBannerProps> = ({
  pendingAction,
  players,
  currentPlayerId,
  onBlock,
  onChallenge,
  onResolve,
}) => {
  const fromPlayer = players.find(
    (p) => p.playerId === pendingAction.fromPlayerId,
  );
  const toPlayer = pendingAction.toPlayerId
    ? players.find((p) => p.playerId === pendingAction.toPlayerId)
    : null;

  const canBlock = currentPlayerId !== pendingAction.fromPlayerId;
  const canChallenge = currentPlayerId !== pendingAction.fromPlayerId;
  const canResolve = true; // Any player can resolve typically

  // Determine if this action can be blocked or challenged
  const blockableActions = ["TAX", "STEAL", "ASSASSINATE", "FOREIGN_AID"];
  const challengeableActions = ["TAX", "STEAL", "ASSASSINATE", "EXCHANGE"];

  const isBlockable = blockableActions.includes(pendingAction.type);
  const isChallengeable = challengeableActions.includes(pendingAction.type);

  return (
    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-500/30 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-lg">Pending Action</h3>
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-yellow-100">
              <span className="text-yellow-300">{pendingAction.type}</span> by{" "}
              <span className="text-blue-300">
                {fromPlayer?.name || "Unknown Player"}
              </span>
            </div>

            {toPlayer && (
              <div className="text-sm text-gray-300">
                Target:{" "}
                <span className="text-red-300 font-medium">
                  {toPlayer.name}
                </span>
              </div>
            )}

            {pendingAction.blockedBy && (
              <div className="text-sm text-yellow-300 font-medium">
                ⚠️ Blocked by {pendingAction.blockedBy}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center ml-4">
          {isBlockable && canBlock && (
            <button
              onClick={onBlock}
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
              title="Block this action">
              🛡️ Block
            </button>
          )}

          {isChallengeable && canChallenge && (
            <button
              onClick={onChallenge}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
              title="Challenge this action">
              ⚔️ Challenge
            </button>
          )}

          {canResolve && (
            <button
              onClick={onResolve}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
              title="Resolve and continue">
              ✓ Resolve
            </button>
          )}
        </div>
      </div>

      {/* Action Description */}
      <div className="mt-3 pt-3 border-t border-yellow-500/20">
        <div className="text-xs text-gray-300">
          {getActionDescription(pendingAction.type)}
        </div>
      </div>
    </div>
  );
};

// Helper function to get action descriptions
function getActionDescription(actionType: string): string {
  const descriptions: Record<string, string> = {
    INCOME: "Take 1 coin from the treasury (cannot be blocked or challenged)",
    FOREIGN_AID: "Take 2 coins from the treasury (can be blocked by Duke)",
    COUP: "Pay 7 coins to the treasury to eliminate a player (cannot be blocked or challenged)",
    ASSASSINATE:
      "Pay 3 coins to the treasury to eliminate a player (can be blocked by Contessa)",
    STEAL:
      "Take 2 coins from another player (can be blocked by Captain or Ambassador)",
    TAX: "Take 3 coins from the treasury (can be blocked by Contessa)",
    EXCHANGE: "Exchange cards with the deck (cannot be blocked or challenged)",
    BLOCK: "Block an action (requires a specific role)",
    CHALLENGE: "Challenge an action (requires a specific role)",
    RESOLVE_ACTION: "Resolve the pending action and continue the game",
  };
  return descriptions[actionType] || "Unknown action";
}

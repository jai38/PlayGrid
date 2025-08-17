// src/games/coup/components/SimpleGameBoard.tsx
import React from "react";
import type { CoupPlayerExtended } from "../types/cards.types";
import { SimplePlayerArea } from "./SimplePlayerArea";

interface SimpleGameBoardProps {
  players: CoupPlayerExtended[];
  currentTurnPlayerId: string;
  currentPlayerId: string;
}

export const SimpleGameBoard: React.FC<SimpleGameBoardProps> = ({
  players,
  currentTurnPlayerId,
  currentPlayerId,
}) => {
  // Sort players to put current player first, then others
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.playerId === currentPlayerId) return -1;
    if (b.playerId === currentPlayerId) return 1;
    return 0;
  });

  return (
    <div className="w-full">
      {/* Turn Indicator */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-600">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-white font-medium">
            {players.find(p => p.playerId === currentTurnPlayerId)?.name || "Unknown"}'s Turn
          </span>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {sortedPlayers.map((player) => (
          <SimplePlayerArea
            key={player.playerId}
            player={player}
            isCurrentPlayer={player.playerId === currentPlayerId}
            isActivePlayer={player.playerId === currentTurnPlayerId}
          />
        ))}
      </div>
    </div>
  );
};
// src/games/coup/components/SimplePlayerArea.tsx
import React from "react";
import type { CoupPlayerExtended } from "../types/cards.types";

interface SimplePlayerAreaProps {
  player: CoupPlayerExtended;
  isCurrentPlayer: boolean;
  isActivePlayer: boolean;
}

export const SimplePlayerArea: React.FC<SimplePlayerAreaProps> = ({
  player,
  isCurrentPlayer,
  isActivePlayer,
}) => {
  const aliveInfluences = player.influences?.filter((card) => !card.isLost) || [];
  const isAlive = player.isAlive;

  return (
    <div
      className={`
        p-3 rounded-lg border transition-all duration-200
        ${isCurrentPlayer 
          ? "border-blue-500 bg-blue-900/20 shadow-lg shadow-blue-500/20" 
          : "border-slate-600 bg-slate-800/60"
        }
        ${isActivePlayer 
          ? "ring-2 ring-yellow-400 ring-opacity-50" 
          : ""
        }
        ${!isAlive 
          ? "opacity-50 grayscale" 
          : ""
        }
      `}>
      
      {/* Player Name and Status */}
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-sm ${
          isCurrentPlayer ? "text-blue-300" : "text-white"
        }`}>
          {player.name}
          {isCurrentPlayer && <span className="ml-1 text-xs">(You)</span>}
        </h3>
        
        {isActivePlayer && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-400 font-medium">Turn</span>
          </div>
        )}
        
        {!isAlive && (
          <span className="text-xs text-red-400 font-medium">Eliminated</span>
        )}
      </div>

      {/* Coins and Cards Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">🪙</span>
          <span className="text-white font-semibold">{player.coins}</span>
          <span className="text-xs text-gray-400">coins</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-red-400">❤️</span>
          <span className="text-white font-semibold">{aliveInfluences.length}</span>
          <span className="text-xs text-gray-400">cards</span>
        </div>
      </div>

      {/* Card backs representation */}
      <div className="mt-2 flex gap-1 justify-center">
        {aliveInfluences.map((_, index) => (
          <div
            key={index}
            className="w-6 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded border border-blue-500/30 shadow-sm"
          />
        ))}
        {Array.from({ length: Math.max(0, 2 - aliveInfluences.length) }).map((_, index) => (
          <div
            key={`lost-${index}`}
            className="w-6 h-8 bg-gradient-to-b from-red-800 to-red-900 rounded border border-red-600/30 shadow-sm opacity-30"
          />
        ))}
      </div>
    </div>
  );
};
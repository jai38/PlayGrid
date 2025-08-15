// src/games/coup/components/GameTable.tsx
import React from "react";
import { PlayerCard } from "./PlayerCard";
import type { CoupPlayer, CoinAnimation } from "../types/coup.types";

interface GameTableProps {
  players: CoupPlayer[];
  currentTurnPlayerId: string;
  animateCoin: CoinAnimation | null;
}

export const GameTable: React.FC<GameTableProps> = ({
  players,
  currentTurnPlayerId,
  animateCoin,
}) => {
  if (!players || players.length === 0) {
    return (
      <div className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">🎮</div>
            <div>Waiting for players...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-6">
      <svg viewBox="0 0 1200 520" className="w-full rounded-lg">
        <defs>
          {/* Table Gradient */}
          <linearGradient id="tableGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#071036" />
            <stop offset="100%" stopColor="#0b1228" />
          </linearGradient>

          {/* Spotlight Effect */}
          <radialGradient id="spot" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Table Border Pattern */}
          <pattern
            id="felt"
            patternUnits="userSpaceOnUse"
            width="20"
            height="20">
            <rect width="20" height="20" fill="#0f172a" />
            <circle cx="10" cy="10" r="1" fill="#1e293b" fillOpacity="0.5" />
          </pattern>
        </defs>

        {/* Table Base */}
        <g transform="translate(600,260)">
          <ellipse
            rx="520"
            ry="170"
            fill="url(#tableGrad)"
            stroke="#0b1228"
            strokeWidth="2"
          />
          <ellipse rx="520" ry="170" fill="url(#spot)" />

          {/* Table Edge Detail */}
          <ellipse
            rx="520"
            ry="170"
            fill="none"
            stroke="url(#felt)"
            strokeWidth="4"
            opacity="0.3"
          />
        </g>

        {/* Center Game Logo/Badge */}
        <g transform="translate(600,260)">
          <rect
            x="-240"
            y="-100"
            rx="12"
            ry="12"
            width="480"
            height="200"
            fill="#0f172a"
            stroke="#0b1228"
            strokeWidth="2"
            fillOpacity="0.9"
          />

          {/* Game Title */}
          <text
            x="0"
            y="-30"
            textAnchor="middle"
            fill="#c7d2fe"
            fontSize="28"
            fontWeight="700"
            letterSpacing="2px">
            COUP
          </text>

          {/* Subtitle */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="16"
            fontWeight="400">
            Bluff • Challenge • Claim
          </text>

          {/* Decorative Elements */}
          <g opacity="0.4">
            <circle cx="-180" cy="0" r="3" fill="#7c3aed" />
            <circle cx="-160" cy="-10" r="2" fill="#5b21b6" />
            <circle cx="-140" cy="5" r="2.5" fill="#7c3aed" />

            <circle cx="180" cy="0" r="3" fill="#7c3aed" />
            <circle cx="160" cy="-10" r="2" fill="#5b21b6" />
            <circle cx="140" cy="5" r="2.5" fill="#7c3aed" />
          </g>
        </g>

        {/* Position Players Around Table */}
        {players.map((player, index) => {
          const totalPlayers = players.length;
          const angle = (index / totalPlayers) * Math.PI * 2 - Math.PI / 2;
          const radiusX = 380;
          const radiusY = 120;

          const x = 600 + Math.cos(angle) * radiusX;
          const y = 260 + Math.sin(angle) * radiusY;

          // Calculate rotation to face center (but keep cards upright)
          const rotationAngle = (angle * 180) / Math.PI + 90;

          return (
            <g
              key={player.playerId || `player-${index}`}
              transform={`translate(${x}, ${y}) rotate(${rotationAngle})`}>
              <foreignObject x={-130} y={-70} width={260} height={140}>
                <div
                  style={{
                    width: 260,
                    height: 140,
                    transform: "rotate(-90deg)", // Keep cards readable
                  }}>
                  <PlayerCard
                    player={player}
                    isActive={player.playerId === currentTurnPlayerId}
                    showCoinAnimation={
                      animateCoin?.id === player.playerId &&
                      animateCoin.amount !== 0
                    }
                    coinAnimationAmount={animateCoin?.amount || 0}
                  />
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Current Turn Indicator */}
        {currentTurnPlayerId && (
          <g transform="translate(600,260)">
            <circle
              cx="0"
              cy="-120"
              r="12"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              className="turn-ring"
            />
            <text
              x="0"
              y="-145"
              textAnchor="middle"
              fill="#60a5fa"
              fontSize="14"
              fontWeight="600">
              Current Turn
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

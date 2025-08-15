// src/games/coup/components/PlayerCard.tsx
import React from "react";
import type { CoupPlayer } from "../types/coup.types";

interface PlayerCardProps {
  player: CoupPlayer;
  isActive: boolean;
  showCoinAnimation?: boolean;
  coinAnimationAmount?: number;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  showCoinAnimation = false,
  coinAnimationAmount = 0,
}) => {
  const initial = player.name?.charAt(0)?.toUpperCase() || "?";
  const playerId = player.playerId || "unknown";

  return (
    <div
      className={`player-card transform transition-all duration-400 ${
        isActive ? "scale-105 ring-active" : "hover:scale-102"
      } ${!player.isAlive ? "opacity-60" : ""}`}
      style={{ width: 260, height: 140 }}
      role="group"
      aria-label={`${player.name} (${player.coins} coins, ${
        player.isAlive ? "alive" : "eliminated"
      })`}>
      <svg viewBox="0 0 220 120" className="w-full h-full block">
        <defs>
          <linearGradient id={`g-${playerId}`} x1="0" x2="1">
            <stop
              offset="0%"
              stopColor={player.isAlive ? "#5b21b6" : "#374151"}
              stopOpacity="0.95"
            />
            <stop
              offset="100%"
              stopColor={player.isAlive ? "#0f172a" : "#1f2937"}
              stopOpacity="0.9"
            />
          </linearGradient>
          <filter
            id={`shadow-${playerId}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation={isActive ? "12" : "8"}
              floodColor={isActive ? "#60a5fa" : "#000"}
              floodOpacity={isActive ? "0.8" : "0.6"}
            />
          </filter>
          {isActive && (
            <filter id={`glow-${playerId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Card Background */}
        <g filter={`url(#shadow-${playerId})`}>
          <rect
            x="6"
            y="8"
            rx="14"
            ry="14"
            width="208"
            height="104"
            fill={`url(#g-${playerId})`}
            stroke={isActive ? "#60a5fa" : "#374151"}
            strokeWidth={isActive ? "2" : "1"}
          />
        </g>

        {/* Player Avatar */}
        <g transform="translate(24, 32)">
          <circle
            cx="0"
            cy="0"
            r="26"
            fill={player.isAlive ? "#7c3aed" : "#6b7280"}
            filter={isActive ? `url(#glow-${playerId})` : undefined}
          />
          <text
            x="0"
            y="8"
            fontSize="28"
            fill="#fff"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle">
            {initial}
          </text>
        </g>

        {/* Player Name */}
        <text
          x="72"
          y="42"
          fontSize="16"
          fill={player.isAlive ? "#fff" : "#9ca3af"}
          fontWeight="700">
          {player.name || "Unknown"}
        </text>

        {/* Coin Count */}
        <g transform="translate(168,30)">
          <circle
            cx="0"
            cy="0"
            r="18"
            fill={player.isAlive ? "#f59e0b" : "#78716c"}
          />
          <text
            x="0"
            y="6"
            fontSize="14"
            fill="#000"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle">
            {player.coins || 0}
          </text>
        </g>

        {/* Status Text */}
        <text
          x="72"
          y="72"
          fontSize="12"
          fill={player.isAlive ? "#d1fae5" : "#fca5a5"}>
          {player.isAlive ? "Alive" : "Eliminated"}
        </text>

        {/* Revealed Cards Indicator */}
        {(player.revealedCards?.length || 0) > 0 && (
          <g transform="translate(72, 85)">
            <text x="0" y="0" fontSize="10" fill="#f87171">
              {player.revealedCards} revealed
            </text>
          </g>
        )}

        {/* Turn Indicator */}
        {isActive && (
          <g transform="translate(200, 16)">
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
              className="turn-ring"
            />
            <circle cx="0" cy="0" r="4" fill="#60a5fa" />
          </g>
        )}
      </svg>

      {/* Coin Animation */}
      {showCoinAnimation && coinAnimationAmount !== 0 && (
        <div className="absolute -top-2 right-4 pointer-events-none">
          <div className="coin-fly px-2 py-1 rounded-full bg-yellow-400 text-black text-sm font-bold">
            {coinAnimationAmount > 0
              ? `+${coinAnimationAmount}`
              : `${coinAnimationAmount}`}
          </div>
        </div>
      )}
    </div>
  );
};

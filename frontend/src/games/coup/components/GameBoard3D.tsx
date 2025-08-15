// src/games/coup/components/GameBoard3D.tsx
import React from "react";
import type { CoupPlayerExtended } from "../types/cards.types";
import type { CoinAnimation } from "../types/coup.types";
import { PlayerArea3D } from "./PlayerArea3D";

interface GameBoard3DProps {
  players: CoupPlayerExtended[];
  currentTurnPlayerId: string;
  currentPlayerId: string;
  animateCoin: CoinAnimation | null;
}

export const GameBoard3D: React.FC<GameBoard3DProps> = ({
  players,
  currentTurnPlayerId,
  currentPlayerId,
  animateCoin,
}) => {
  const maxPlayers = 6;
  const playerCount = players.length;

  // Calculate optimal positioning for players around oval table
  const getPlayerPosition = (index: number, total: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radiusX = 45; // Percentage of container width
    const radiusY = 35; // Percentage of container height

    // Convert to percentage positions
    const x = 50 + Math.cos(angle) * radiusX;
    const y = 50 + Math.sin(angle) * radiusY;

    // Calculate rotation to face center (but keep content upright)
    const rotation = ((angle * 180) / Math.PI + 90) % 360;

    return { x, y, rotation, angle };
  };

  return (
    <div className="game-board-3d relative w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 3D Perspective Container */}
      <div
        className="board-perspective relative w-full h-[600px] md:h-[700px] lg:h-[800px]"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "center center",
        }}>
        {/* Main Table Surface */}
        <div
          className="table-surface absolute inset-0 rounded-2xl"
          style={{
            transform: "rotateX(25deg) translateZ(-20px)",
            transformStyle: "preserve-3d",
          }}>
          {/* Table Background with SVG */}
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full absolute inset-0"
            style={{ transform: "translateZ(10px)" }}>
            <defs>
              {/* Table surface gradients */}
              <radialGradient id="tableGradient" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>

              {/* Felt texture pattern */}
              <pattern
                id="feltTexture"
                patternUnits="userSpaceOnUse"
                width="50"
                height="50">
                <rect width="50" height="50" fill="#0f172a" />
                <circle cx="25" cy="25" r="1" fill="#1e293b" opacity="0.5" />
                <circle
                  cx="12.5"
                  cy="12.5"
                  r="0.5"
                  fill="#334155"
                  opacity="0.3"
                />
                <circle
                  cx="37.5"
                  cy="37.5"
                  r="0.5"
                  fill="#334155"
                  opacity="0.3"
                />
              </pattern>

              {/* Wood grain for table edge */}
              <linearGradient id="woodGrain" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="20%" stopColor="#a16207" />
                <stop offset="40%" stopColor="#92400e" />
                <stop offset="60%" stopColor="#a16207" />
                <stop offset="80%" stopColor="#92400e" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>

              {/* Center logo glow */}
              <filter
                id="centerGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer table ring (wood) */}
            <ellipse
              cx="400"
              cy="300"
              rx="380"
              ry="280"
              fill="url(#woodGrain)"
              stroke="#78350f"
              strokeWidth="4"
            />

            {/* Inner playing surface (felt) */}
            <ellipse
              cx="400"
              cy="300"
              rx="340"
              ry="240"
              fill="url(#tableGradient)"
            />

            {/* Felt texture overlay */}
            <ellipse
              cx="400"
              cy="300"
              rx="340"
              ry="240"
              fill="url(#feltTexture)"
              opacity="0.4"
            />

            {/* Decorative inner border */}
            <ellipse
              cx="400"
              cy="300"
              rx="320"
              ry="220"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              opacity="0.6"
            />

            {/* Center game logo */}
            <g transform="translate(400, 300)" filter="url(#centerGlow)">
              {/* Logo background */}
              <circle
                r="80"
                fill="rgba(15, 23, 42, 0.8)"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Main title */}
              <text
                y="-10"
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="24"
                fontWeight="bold"
                letterSpacing="2px">
                COUP
              </text>

              {/* Subtitle */}
              <text
                y="15"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="12"
                fontWeight="normal">
                BLUFF • DECEIVE • SURVIVE
              </text>

              {/* Decorative elements */}
              <g opacity="0.6">
                <circle cx="-50" cy="0" r="3" fill="#7c3aed" />
                <circle cx="50" cy="0" r="3" fill="#dc2626" />
                <circle cx="0" cy="-45" r="2" fill="#059669" />
                <circle cx="0" cy="45" r="2" fill="#0ea5e9" />
              </g>
            </g>

            {/* Turn indicator circle */}
            {currentTurnPlayerId && (
              <g transform="translate(400, 300)">
                <circle
                  r="100"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="3"
                  opacity="0.4"
                  className="animate-spin"
                  style={{ animationDuration: "10s" }}
                />
                <text
                  y="-120"
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="14"
                  fontWeight="600">
                  Current Turn
                </text>
              </g>
            )}
          </svg>

          {/* Player Areas positioned around table */}
          {players.map((player, index) => {
            const position = getPlayerPosition(index, playerCount);
            const isCurrentPlayer = player.playerId === currentPlayerId;
            const isActive = player.playerId === currentTurnPlayerId;

            return (
              <PlayerArea3D
                key={player.playerId}
                player={player}
                position={position}
                isCurrentPlayer={isCurrentPlayer}
                isActive={isActive}
                showCoinAnimation={
                  animateCoin?.id === player.playerId &&
                  animateCoin.amount !== 0
                }
                coinAnimationAmount={animateCoin?.amount || 0}
              />
            );
          })}

          {/* Empty player slots for visual completeness */}
          {playerCount < maxPlayers &&
            Array.from({ length: maxPlayers - playerCount }).map((_, index) => {
              const position = getPlayerPosition(
                playerCount + index,
                maxPlayers,
              );

              return (
                <div
                  key={`empty-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: `translate(-50%, -50%) rotateZ(${position.rotation}deg) translateZ(30px)`,
                  }}>
                  <div className="w-32 h-20 bg-slate-700/30 border border-slate-600/50 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500 text-sm">Empty Seat</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Atmospheric lighting effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-10 w-48 h-48 bg-green-500/5 rounded-full blur-xl" />
        </div>
      </div>

      {/* Responsive overlay for mobile optimization */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

      {/* Game status overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live Game • {playerCount} Players</span>
        </div>
      </div>

      {/* Coin treasury visualization */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400">🪙</span>
          <span>Treasury: ♾️</span>
        </div>
      </div>
    </div>
  );
};

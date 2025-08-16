// src/games/coup/components/PlayerArea3D.tsx
import React from "react";
import type { CoupPlayerExtended } from "../types/cards.types";
import { InfluenceCard } from "./InfluenceCard";

interface PlayerPosition {
  x: number;
  y: number;
  rotation: number;
  angle: number;
}

interface PlayerArea3DProps {
  player: CoupPlayerExtended;
  position: PlayerPosition;
  isCurrentPlayer: boolean;
  isActive: boolean;
  showCoinAnimation: boolean;
  coinAnimationAmount: number;
}

export const PlayerArea3D: React.FC<PlayerArea3DProps> = ({
  player,
  position,
  isCurrentPlayer,
  isActive,
  showCoinAnimation,
  coinAnimationAmount,
}) => {
  const cardCount = player.influences?.length || 2;
  const aliveInfluences =
    player.influences?.filter((card) => !card.isLost) || [];
  const lostInfluences = player.influences?.filter((card) => card.isLost) || [];

  // Calculate if player is on bottom half of table for better text positioning
  const isBottomHalf = position.y > 50;
  const isRightSide = position.x > 50;

  return (
    <div
      className={`player-area absolute transform transition-all duration-500 ${
        isCurrentPlayer ? "z-20" : "z-10"
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `
          translate(-50%, -50%) 
          rotateZ(${position.rotation}deg) 
          translateZ(${isCurrentPlayer ? 40 : 20}px)
          ${isActive ? "scale(1.05)" : "scale(1)"}
        `,
        transformStyle: "preserve-3d",
      }}>
      {/* Player Platform */}
      <div
        className={`relative ${
          isCurrentPlayer ? "w-40 h-28" : "w-36 h-24"
        } transition-all duration-300`}>
        {/* Platform Base */}
        <div
          className={`absolute inset-0 rounded-xl shadow-2xl transition-all duration-300 ${
            isCurrentPlayer
              ? "bg-gradient-to-br from-blue-900/80 to-indigo-900/80 border-2 border-blue-400/60"
              : isActive
              ? "bg-gradient-to-br from-purple-900/70 to-violet-900/70 border-2 border-purple-400/60"
              : player.isAlive
              ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/40"
              : "bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-600/30"
          }`}
          style={{
            transform: "translateZ(-5px)",
            backdropFilter: "blur(10px)",
          }}
        />

        {/* Active Player Glow */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-xl animate-pulse"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
              transform: "translateZ(-10px)",
            }}
          />
        )}

        {/* Player Content Container */}
        <div
          className="relative w-full h-full p-2 flex flex-col items-center justify-between"
          style={{
            transform: `rotateZ(-${position.rotation}deg)`, // Counter-rotate content
          }}>
          {/* Player Info Header */}
          <div
            className={`w-full text-center ${
              isBottomHalf ? "order-3" : "order-1"
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {/* Avatar */}
              <div
                className={`rounded-full font-bold text-white flex items-center justify-center ${
                  isCurrentPlayer ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs"
                } ${
                  player.isAlive
                    ? isCurrentPlayer
                      ? "bg-blue-600"
                      : isActive
                      ? "bg-purple-600"
                      : "bg-slate-600"
                    : "bg-gray-600"
                }`}>
                {player.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Player Name */}
              <span
                className={`font-semibold text-white truncate max-w-16 ${
                  isCurrentPlayer ? "text-sm" : "text-xs"
                }`}>
                {player.name}
              </span>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {/* Coins */}
              <div className="flex items-center gap-1 bg-yellow-600/80 rounded-full px-2 py-0.5">
                <span className="text-yellow-100">🪙</span>
                <span className="text-white font-bold">{player.coins}</span>
              </div>

              {/* Lives/Influences */}
              <div
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${
                  aliveInfluences.length > 0
                    ? "bg-green-600/80"
                    : "bg-red-600/80"
                }`}>
                <span className="text-white">❤️</span>
                <span className="text-white font-bold">
                  {aliveInfluences.length}
                </span>
              </div>
            </div>
          </div>

          {/* Influence Cards */}
          <div
            className={`flex items-center justify-center gap-1 ${
              isBottomHalf ? "order-1" : "order-3"
            }`}>
            {/* Alive Influences */}
            {aliveInfluences.map((influence, index) => (
              <div
                key={influence.id}
                className="transform transition-all duration-300 hover:scale-110"
                style={{
                  transform: `rotateY(${index * 5 - 2.5}deg) translateZ(${
                    index * 2
                  }px)`,
                  zIndex: aliveInfluences.length - index,
                }}>
                <InfluenceCard
                  card={influence}
                  isHidden={!isCurrentPlayer && !influence.isRevealed}
                  isMyCard={isCurrentPlayer}
                  size="small"
                  rotation={index * 2 - 1}
                />
              </div>
            ))}

            {/* Fill empty slots if less than 2 influences */}
            {aliveInfluences.length < 2 &&
              Array.from({
                length: 2 - aliveInfluences.length,
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="opacity-40"
                  style={{
                    transform: `rotateY(${
                      (aliveInfluences.length + index) * 5 - 2.5
                    }deg) translateZ(${
                      (aliveInfluences.length + index) * 2
                    }px)`,
                  }}>
                  <InfluenceCard
                    size="small"
                    rotation={(aliveInfluences.length + index) * 2 - 1}
                  />
                </div>
              ))}
          </div>

          {/* Lost Influences (smaller, faded) */}
          {lostInfluences.length > 0 && (
            <div
              className={`flex items-center justify-center gap-0.5  ${
                isBottomHalf ? "order-2" : "order-2"
              }`}>
              {lostInfluences.map((influence, index) => (
                <div
                  key={`lost-${influence.id}`}
                  className="transform scale-75"
                  style={{
                    transform: `scale(0.6) rotateY(${index * 10}deg)`,
                    zIndex: -index,
                  }}>
                  <InfluenceCard
                    card={influence}
                    isHidden={false}
                    size="small"
                    rotation={index * 5}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Turn Indicator */}
          {isActive && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
          )}

          {/* Current Player Indicator */}
          {isCurrentPlayer && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-400 text-blue-900 text-xs font-bold px-2 py-0.5 rounded-full">
                YOU
              </div>
            </div>
          )}

          {/* Eliminated Overlay */}
          {!player.isAlive && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="text-red-400 font-bold text-xs transform rotate-12">
                ELIMINATED
              </div>
            </div>
          )}

          {/* Coin Animation */}
          {showCoinAnimation && coinAnimationAmount !== 0 && (
            <div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
              style={{
                transform: `translateZ(50px) rotateZ(-${position.rotation}deg)`,
              }}>
              <div className="coin-fly bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                {coinAnimationAmount > 0
                  ? `+${coinAnimationAmount}`
                  : `${coinAnimationAmount}`}
              </div>
            </div>
          )}
        </div>

        {/* Connection Line to Center (subtle) */}
        {isActive && (
          <div
            className="absolute top-1/2 left-1/2 w-0.5 bg-purple-400/30 origin-bottom"
            style={{
              height: `${
                Math.abs(position.angle) > Math.PI / 2 ? "60px" : "80px"
              }`,
              transform: `
                translate(-50%, -100%) 
                rotateZ(${90 + (position.angle * 180) / Math.PI}deg)
                translateZ(-15px)
              `,
              transformOrigin: "bottom center",
            }}
          />
        )}
      </div>
    </div>
  );
};

// src/games/coup/components/InfluenceCard.tsx
import React from "react";
import {
  type InfluenceCard as ICard,
  InfluenceType,
  INFLUENCE_CONFIG,
} from "../types/cards.types";

interface InfluenceCardProps {
  card?: ICard;
  isHidden?: boolean;
  isMyCard?: boolean;
  size?: "small" | "medium" | "large";
  rotation?: number;
  elevation?: number;
  onClick?: () => void;
}

export const InfluenceCard: React.FC<InfluenceCardProps> = ({
  card,
  isHidden = false,
  isMyCard = false,
  size = "medium",
  rotation = 0,
  elevation = 0,
  onClick,
}) => {
  const config = card ? INFLUENCE_CONFIG[card.type] : null;
  const cardId = card?.id || `card-${Math.random()}`;

  const dimensions = {
    small: { width: 48, height: 68, fontSize: 16 },
    medium: { width: 64, height: 90, fontSize: 20 },
    large: { width: 80, height: 112, fontSize: 24 },
  };

  const dim = dimensions[size];
  const isRevealed = card?.isRevealed || false;
  const isLost = card?.isLost || false;

  return (
    <div
      className={`influence-card ${onClick ? "cursor-pointer" : ""}`}
      style={{
        width: dim.width,
        height: dim.height,
        transform: `rotateZ(${rotation}deg) translateZ(${elevation}px)`,
        transformStyle: "preserve-3d",
        transition: "all 0.3s ease",
      }}
      onClick={onClick}>
      <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 80 112"
        className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
        <defs>
          {/* Card gradients */}
          {config && (
            <>
              <linearGradient
                id={`cardGrad-${cardId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%">
                <stop offset="0%" stopColor={config.color} />
                <stop offset="50%" stopColor={config.secondaryColor} />
                <stop offset="100%" stopColor={config.color} />
              </linearGradient>
              <linearGradient
                id={`cardShine-${cardId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </>
          )}

          {/* Hidden card gradient */}
          <linearGradient
            id={`hiddenGrad-${cardId}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Card shadow filter */}
          <filter
            id={`cardShadow-${cardId}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              floodColor="#000"
              floodOpacity="0.4"
            />
          </filter>

          {/* Pattern for hidden cards */}
          <pattern
            id={`backPattern-${cardId}`}
            patternUnits="userSpaceOnUse"
            width="8"
            height="8">
            <rect width="8" height="8" fill="#0f172a" />
            <path
              d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6"
              stroke="#374151"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        {/* Card Base */}
        <rect
          x="2"
          y="2"
          width="76"
          height="108"
          rx="8"
          ry="8"
          fill={
            isHidden
              ? `url(#hiddenGrad-${cardId})`
              : config
              ? `url(#cardGrad-${cardId})`
              : "#374151"
          }
          stroke={isLost ? "#ef4444" : isMyCard ? "#60a5fa" : "#64748b"}
          strokeWidth={isLost ? "3" : isMyCard ? "2" : "1"}
          filter={`url(#cardShadow-${cardId})`}
        />

        {/* Card Content */}
        {isHidden ? (
          /* Hidden Card Design */
          <>
            <rect
              x="6"
              y="6"
              width="68"
              height="100"
              rx="6"
              fill={`url(#backPattern-${cardId})`}
            />
            <text
              x="40"
              y="60"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
              fontWeight="bold">
              COUP
            </text>
            <circle
              cx="40"
              cy="30"
              r="8"
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />
            <circle
              cx="40"
              cy="82"
              r="8"
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />
          </>
        ) : config ? (
          /* Revealed Card Design */
          <>
            {/* Card shine effect */}
            <rect
              x="2"
              y="2"
              width="76"
              height="108"
              rx="8"
              fill={`url(#cardShine-${cardId})`}
            />

            {/* Character symbol background */}
            <circle
              cx="40"
              cy="35"
              r="18"
              fill="rgba(255,255,255,0.2)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />

            {/* Character symbol */}
            <text
              x="40"
              y="42"
              textAnchor="middle"
              fill="white"
              fontSize={dim.fontSize + 4}
              fontWeight="bold"
              className="select-none">
              {config.symbol}
            </text>

            {/* Character name */}
            <text
              x="40"
              y="65"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
              className="select-none">
              {config.name.toUpperCase()}
            </text>

            {/* Power description */}
            <foreignObject x="6" y="72" width="68" height="30">
              <div
                className="text-white text-center"
                style={{ fontSize: "6px", lineHeight: "8px" }}>
                <div className="font-semibold">{config.power}</div>
                {config.blocks !== "None" && (
                  <div className="opacity-80 mt-1">Blocks: {config.blocks}</div>
                )}
              </div>
            </foreignObject>

            {/* Corner decorations */}
            <text
              x="12"
              y="18"
              fill="rgba(255,255,255,0.6)"
              fontSize="10"
              fontWeight="bold">
              {config.symbol}
            </text>
            <text
              x="68"
              y="102"
              fill="rgba(255,255,255,0.6)"
              fontSize="10"
              fontWeight="bold"
              transform="rotate(180 68 102)">
              {config.symbol}
            </text>
          </>
        ) : (
          /* Empty card slot */
          <>
            <rect
              x="6"
              y="6"
              width="68"
              height="100"
              rx="6"
              fill="rgba(100,116,139,0.3)"
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text
              x="40"
              y="60"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10">
              Empty
            </text>
          </>
        )}

        {/* Status overlays */}
        {isRevealed && !isLost && (
          <g>
            <rect
              x="0"
              y="0"
              width="80"
              height="112"
              rx="8"
              fill="rgba(239,68,68,0.3)"
            />
            <text
              x="40"
              y="60"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="12"
              fontWeight="bold">
              REVEALED
            </text>
          </g>
        )}

        {isLost && (
          <g>
            <rect
              x="0"
              y="0"
              width="80"
              height="112"
              rx="8"
              fill="rgba(0,0,0,0.6)"
            />
            <line
              x1="15"
              y1="25"
              x2="65"
              y2="87"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1="65"
              y1="25"
              x2="15"
              y2="87"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <text
              x="40"
              y="102"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="8"
              fontWeight="bold">
              LOST
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

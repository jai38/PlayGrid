import { useState, useEffect, useRef } from "react";

// Utility to generate dice dots based on number (1–6)
export default function DiceFace({ number }: { number: number }) {
  // Positions for dots on a 5x5 grid (rough)
  const dotPositions: Record<number, [number, number][]> = {
    1: [[2, 2]],
    2: [
      [1, 1],
      [3, 3],
    ],
    3: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    4: [
      [1, 1],
      [1, 3],
      [3, 1],
      [3, 3],
    ],
    5: [
      [1, 1],
      [1, 3],
      [2, 2],
      [3, 1],
      [3, 3],
    ],
    6: [
      [1, 1],
      [1, 2],
      [1, 3],
      [3, 1],
      [3, 2],
      [3, 3],
    ],
  };

  const dots = dotPositions[number] || [];

  return (
    <svg
      viewBox="0 0 4 4"
      width="80"
      height="80"
      className="drop-shadow-lg"
      fill="white"
      stroke="#222"
      strokeWidth="0.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        borderRadius: "12%",
        backgroundColor: "#fcd34d" /* Tailwind yellow-300 */,
      }}>
      {/* Dice body */}
      <rect
        x="0.15"
        y="0.15"
        width="3.7"
        height="3.7"
        rx="0.5"
        ry="0.5"
        fill="#fcd34d"
      />
      {/* Dice dots */}
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.3" fill="#1e3a8a" /> // Tailwind blue-900
      ))}
    </svg>
  );
}

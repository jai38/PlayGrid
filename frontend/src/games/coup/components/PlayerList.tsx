import type { CoupPlayer } from "../types";

export default function PlayerList({
  players,
  currentTurnPlayerId,
}: {
  players: CoupPlayer[];
  currentTurnPlayerId: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Players</h3>
      <ul className="space-y-1">
        {players.map((p) => (
          <li
            key={p.playerId}
            className={`p-2 rounded flex justify-between ${
              p.isAlive ? "bg-gray-700" : "bg-gray-500 opacity-50"
            }`}>
            <span>
              {p.name} {p.playerId === currentTurnPlayerId && "🕑"}
            </span>
            <div className="flex gap-2">
              <span>🂠 {p.influence?.length}</span>
              <span>💰 {p.coins}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

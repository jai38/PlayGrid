import type { CoupPlayer } from "../types";

export default function TargetSelector({
  players,
  onSelect,
  onCancel,
}: {
  players: CoupPlayer[];
  onSelect: (id: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg text-white w-64">
        <h3 className="font-semibold mb-4">Select Target</h3>
        {players.map((p) => (
          <button
            key={p.playerId}
            onClick={() => onSelect(p.playerId)}
            disabled={!p.isAlive}
            className={`w-full mb-2 p-2 rounded ${
              p.isAlive ? "bg-blue-500 hover:bg-blue-400" : "bg-gray-500"
            }`}>
            {p.name}
          </button>
        ))}
        <button
          onClick={onCancel}
          className="w-full bg-red-500 hover:bg-red-400 p-2 rounded mt-2">
          Cancel
        </button>
      </div>
    </div>
  );
}

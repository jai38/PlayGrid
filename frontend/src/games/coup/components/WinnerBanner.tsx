import type { CoupGameState } from "../types";

export default function WinnerBanner({ state }: { state: CoupGameState }) {
  if (!state.winner) return null;

  return (
    <div className="bg-green-700 p-3 rounded text-center font-bold">
      Winner: {state.players.find((p) => p.playerId === state.winner)?.name}
    </div>
  );
}

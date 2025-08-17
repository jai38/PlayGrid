import type { ActionPayload } from "../types/coup.types";

export default function ActionButtons({
  isMyTurn,
  sendAction,
  setTargetModal,
}: {
  isMyTurn: boolean;
  sendAction: (type: string, payload?: ActionPayload) => void;
  setTargetModal: (open: boolean) => void;
}) {
  if (!isMyTurn) return null;

  return (
    <div className="mt-4 space-y-2">
      <h3 className="font-semibold">Your Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => sendAction("INCOME")}
          className="bg-blue-500 hover:bg-blue-400 p-2 rounded">
          Income
        </button>
        <button
          onClick={() => sendAction("FOREIGN_AID")}
          className="bg-green-500 hover:bg-green-400 p-2 rounded">
          Foreign Aid
        </button>
        <button
          onClick={() => setTargetModal(true)}
          className="bg-red-500 hover:bg-red-400 p-2 rounded">
          Coup
        </button>
        <button
          onClick={() => setTargetModal(true)}
          className="bg-purple-500 hover:bg-purple-400 p-2 rounded">
          Assassinate
        </button>
        <button
          onClick={() => setTargetModal(true)}
          className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded text-black">
          Steal
        </button>
        <button
          onClick={() => sendAction("EXCHANGE")}
          className="bg-green-500 hover:bg-green-400 p-2 rounded">
          Exchange
        </button>
      </div>
    </div>
  );
}

import type { CoupGameState } from "../types";

export default function PendingActionPopup({
  pendingAction,
  currentPlayerId,
  onBlock,
  onChallenge,
}: {
  pendingAction: CoupGameState["pendingAction"];
  currentPlayerId: string;
  onBlock: (role: string) => void;
  onChallenge: () => void;
}) {
  if (!pendingAction) return null;

  // Only show if current player is NOT the actor and is either the target or all-players-can-respond action
  const isActor = pendingAction.actorId === currentPlayerId;
  const isTarget = pendingAction.targetId === currentPlayerId;
  const canRespond =
    !isActor &&
    (isTarget ||
      pendingAction.type === "STEAL" ||
      pendingAction.type === "ASSASSINATE");

  if (!canRespond) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg text-white w-72">
        <h3 className="font-semibold mb-4">Pending: {pendingAction.type}</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onBlock("Duke")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded">
            Block as Duke
          </button>
          <button
            onClick={() => onBlock("Contessa")}
            className="bg-pink-500 hover:bg-pink-400 text-black p-2 rounded">
            Block as Contessa
          </button>
          <button
            onClick={onChallenge}
            className="bg-red-500 hover:bg-red-400 p-2 rounded">
            Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

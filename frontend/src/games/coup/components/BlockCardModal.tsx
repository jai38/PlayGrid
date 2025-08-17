// BlockCardModal.tsx
import { useState } from "react";

export default function BlockCardModal({
  availableCards,
  actionToBlock,
  onSelect,
}: {
  availableCards: string[];
  actionToBlock: string;
  onSelect: (card: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const getCardDescription = (card: string) => {
    switch (card) {
      case "Duke": return "Block Foreign Aid";
      case "Contessa": return "Block Assassination";
      case "Ambassador": return "Block Steal (as Ambassador)";
      case "Captain": return "Block Steal (as Captain)";
      default: return "";
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case "FOREIGN_AID": return "Foreign Aid";
      case "ASSASSINATE": return "Assassination";
      case "STEAL": return "Steal";
      default: return action;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[450px] max-w-[90vw]">
        <h2 className="text-lg font-bold mb-4">
          Choose card to block {getActionDescription(actionToBlock)}
        </h2>
        
        <div className="mb-4 text-sm text-gray-600">
          You are blocking the {getActionDescription(actionToBlock)} action. 
          Select which card you want to claim for the block:
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {availableCards.map((card) => (
            <button
              key={card}
              className={`w-full px-4 py-3 rounded-lg border font-medium transition text-left ${
                selected === card
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setSelected(card)}>
              <div className="font-semibold">{card}</div>
              <div className="text-xs opacity-75">
                {getCardDescription(card)}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Other players can challenge your claim
          </div>
          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selected
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            Block with {selected || "..."}
          </button>
        </div>
      </div>
    </div>
  );
}
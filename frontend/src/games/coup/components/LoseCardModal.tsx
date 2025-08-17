// LoseCardModal.tsx
import { useState } from "react";

export default function LoseCardModal({
  cards,
  onSelect,
}: {
  cards: string[];
  onSelect: (card: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-lg font-bold mb-4">Choose a card to lose</h2>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-lg border font-medium transition ${
                selected === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setSelected(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selected
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ExchangeCardModal.tsx
import { useState } from "react";

export default function ExchangeCardModal({
  availableCards,
  cardsToKeep,
  onSelect,
}: {
  availableCards: string[];
  cardsToKeep: number;
  onSelect: (cards: string[]) => void;
}) {
  const [selected, setSelected] = useState<{ card: string; index: number }[]>(
    [],
  );

  const handleCardClick = (card: string, index: number) => {
    const selectedIndex = selected.findIndex((c) => c.index === index);

    if (selectedIndex !== -1) {
      // Already selected → remove it
      const newSelected = [...selected];
      newSelected.splice(selectedIndex, 1);
      setSelected(newSelected);
    } else if (selected.length < cardsToKeep) {
      // Not selected yet → add it
      setSelected([...selected, { card, index }]);
    }
  };

  const handleSubmit = () => {
    const selectedCards = selected.map((c) => c.card);
    onSelect(selectedCards);
  };

  const getCardSelectionCount = (card: string) => {
    return selected.filter((c) => c.card.startsWith(card)).length;
  };

  const getMaxSelectableForCard = (card: string) => {
    return availableCards.filter((c) => c === card).length;
  };

  const isCardDisabled = (card: string) => {
    return (
      selected.length >= cardsToKeep && !selected.some((c) => c.card === card)
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] max-w-[90vw]">
        <h2 className="text-lg font-bold mb-4">
          Choose {cardsToKeep} card{cardsToKeep > 1 ? "s" : ""} to keep
        </h2>

        <div className="mb-4 text-sm text-gray-600">
          You drew cards and can now choose which ones to keep. Selected:{" "}
          {selected.length}/{cardsToKeep}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {availableCards.map((card, index) => {
            const isSelected = selected.some((c) => c.index === index);

            return (
              <div
                key={index}
                onClick={() => handleCardClick(card, index)}
                className={`p-3 border rounded cursor-pointer text-center ${
                  isSelected ? "bg-blue-500 text-white" : "bg-white text-black"
                }`}>
                {card}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Available cards: {availableCards.length}
          </div>
          <button
            disabled={selected.length !== cardsToKeep}
            onClick={() => selected.length === cardsToKeep && handleSubmit()}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selected.length === cardsToKeep
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}

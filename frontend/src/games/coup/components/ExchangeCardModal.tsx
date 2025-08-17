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
  const [selected, setSelected] = useState<string[]>([]);

  const handleCardClick = (card: string) => {
    const cardIndex = availableCards.indexOf(card);
    const currentlySelectedSameCard = selected.filter(c => c === card).length;
    const totalOfThisCard = availableCards.filter(c => c === card).length;
    
    if (selected.includes(card) && currentlySelectedSameCard > 0) {
      // Remove one instance of this card
      const newSelected = [...selected];
      const indexToRemove = newSelected.indexOf(card);
      newSelected.splice(indexToRemove, 1);
      setSelected(newSelected);
    } else if (selected.length < cardsToKeep && currentlySelectedSameCard < totalOfThisCard) {
      // Add this card if we haven't reached the limit
      setSelected([...selected, card]);
    }
  };

  const getCardSelectionCount = (card: string) => {
    return selected.filter(c => c === card).length;
  };

  const getMaxSelectableForCard = (card: string) => {
    return availableCards.filter(c => c === card).length;
  };

  const isCardDisabled = (card: string) => {
    return selected.length >= cardsToKeep && !selected.includes(card);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] max-w-[90vw]">
        <h2 className="text-lg font-bold mb-4">
          Choose {cardsToKeep} card{cardsToKeep > 1 ? 's' : ''} to keep
        </h2>
        
        <div className="mb-4 text-sm text-gray-600">
          You drew cards and can now choose which ones to keep. 
          Selected: {selected.length}/{cardsToKeep}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Get unique cards to avoid duplicate buttons */}
          {Array.from(new Set(availableCards)).map((card) => {
            const selectionCount = getCardSelectionCount(card);
            const maxSelectable = getMaxSelectableForCard(card);
            const disabled = isCardDisabled(card);
            
            return (
              <div key={card} className="text-center">
                <button
                  className={`w-full px-4 py-3 rounded-lg border font-medium transition ${
                    selectionCount > 0
                      ? "bg-blue-600 text-white border-blue-600"
                      : disabled 
                      ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => handleCardClick(card)}
                  disabled={disabled && selectionCount === 0}>
                  {card}
                  {maxSelectable > 1 && (
                    <div className="text-xs mt-1">
                      {selectionCount}/{maxSelectable} selected
                    </div>
                  )}
                </button>
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
            onClick={() => selected.length === cardsToKeep && onSelect(selected)}
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
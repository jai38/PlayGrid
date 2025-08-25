import React from "react";
import type { CoupPlayerExtended } from "../types/cards.types";
import { InfluenceCard } from "./InfluenceCard";

export const RevealedInfluences = ({
  players,
  currentPlayer,
}: {
  players: CoupPlayerExtended[];
  currentPlayer: CoupPlayerExtended;
}) => {
  const revealedCardsPreview = players.flatMap(
    (player) => player.influences?.filter((c) => c.isLost) || [],
  );

  return (
    revealedCardsPreview.length > 0 && (
      <div className="lg:col-span-1">
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600 p-4">
          <h3 className="text-white font-semibold mb-3 text-sm">
            Revealed Influences
          </h3>
          <div className="space-y-2 flex">
            {players.map((player) => {
              const revealedInfluences =
                player.influences
                  ?.filter((c) => c.isLost)
                  .map((c) => ({ ...c, isLost: false, isRevealed: false })) ||
                [];
              if (revealedInfluences.length > 0) {
                return (
                  <div key={player.playerId} className="flex items-center mx-3">
                    <span className="text-gray-300">{player.name}</span>
                    <div className="ml-2 flex">
                      {revealedInfluences.map((card) => (
                        <div className="mx-1">
                          <InfluenceCard
                            key={card.id}
                            card={card}
                            isMyCard={
                              player.playerId === currentPlayer.playerId
                            }
                            isHidden={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>
      </div>
    )
  );
};

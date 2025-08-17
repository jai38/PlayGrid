// src/games/coup/SimpleCoupUI.tsx
import { useParams } from "react-router-dom";
import { useCoupGame } from "./hooks/useCoupGame";
import { SimpleGameBoard } from "./components/SimpleGameBoard";
import { ResponsiveActionPanel } from "./components/ResponsiveActionPanel";
import { ActionLogPanel } from "./components/ActionLogPanel";
import {
  type CoupPlayerExtended,
  type InfluenceCard,
  InfluenceType,
} from "./types/cards.types";
import LoseCardModal from "./components/LoseCardModal";
import ExchangeCardModal from "./components/ExchangeCardModal";
import BlockCardModal from "./components/BlockCardModal";

/**
 * SimpleCoupUI - Clean and minimal Coup game interface
 *
 * Features:
 * - Clean, minimal design with clear sections
 * - Player area showing name, coins, and card count
 * - Single compact action panel with only relevant actions
 * - Game log panel with compact feed
 * - Turn indicator clearly highlighting whose turn it is
 * - Modal popups for special decisions
 * - Mobile-friendly responsive design
 */
export default function SimpleCoupUI(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();

  // Custom hook for game state management
  const {
    state,
    currentPlayer,
    isMyTurn,
    aliveOpponents,
    error,
    selectedTarget,
    showLoseModal,
    cardsToChoose,
    showExchangeModal,
    exchangeData,
    showBlockCardModal,
    blockCardData,
    setSelectedTarget,
    onActionClick,
    onBlock,
    onChallenge,
    onResolve,
    loseCardChoice,
    exchangeCardChoice,
    blockCardChoice,
  } = useCoupGame(roomId);

  // Transform players to include influence card objects
  const transformedPlayers: CoupPlayerExtended[] =
    state?.players?.map((player) => ({
      ...player,
      influences: [
        ...(player.influence?.map((influence, index) =>
          createInfluenceCard(influence, player.playerId, index, false),
        ) || []),
        ...(player.revealedCards?.map((influence, index) =>
          createInfluenceCard(
            influence,
            player.playerId,
            index,
            true, // Always revealed for revealed cards
          ),
        ) || []),
      ],
    })) || [];

  console.log("Transformed Players:", transformedPlayers);

  const winner = state?.winner;

  // Helper function to create influence card objects
  function createInfluenceCard(
    influence: any,
    playerId: string,
    index: number,
    isRevealed = false,
  ): InfluenceCard {
    // Map string types to enum values
    switch (influence.type || influence) {
      case "DUKE":
      case "Duke":
        return {
          id: `${playerId}-${index}`,
          type: InfluenceType.DUKE,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case "ASSASSIN":
      case "Assassin":
        return {
          id: `${playerId}-${index}`,
          type: InfluenceType.ASSASSIN,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case "CAPTAIN":
      case "Captain":
        return {
          id: `${playerId}-${index}`,
          type: InfluenceType.CAPTAIN,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case "AMBASSADOR":
      case "Ambassador":
        return {
          id: `${playerId}-${index}`,
          type: InfluenceType.AMBASSADOR,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case "CONTESSA":
      case "Contessa":
        return {
          id: `${playerId}-${index}`,
          type: InfluenceType.CONTESSA,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      default:
        return {
          id: `${playerId}-unknown`,
          type: InfluenceType.DUKE, // Default to Duke for unknown types
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
    }
  }

  // Loading state
  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600">
          <div className="text-2xl font-bold mb-4 text-white">COUP</div>
          <div className="text-lg text-blue-300 mb-4">
            Connecting to game...
          </div>
          <div className="text-sm text-gray-400">Room: {roomId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Main Game Layout */}
      <div className="container mx-auto px-4 py-6">
        {/* Error Display */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 backdrop-blur-sm border border-red-500/50 rounded-lg px-4 py-2 text-red-200 text-sm shadow-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Winner Celebration */}
        {winner && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
            <div className="bg-gradient-to-br from-green-900 to-green-800 p-8 rounded-xl border border-green-500 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <div className="text-2xl font-bold text-green-300 mb-2">
                Game Over!
              </div>
              <div className="text-lg text-white">{winner} wins!</div>
            </div>
          </div>
        )}

        {/* LoseCard Modal */}
        {showLoseModal && (
          <LoseCardModal cards={cardsToChoose} onSelect={loseCardChoice} />
        )}

        {/* ExchangeCard Modal */}
        {showExchangeModal && exchangeData && (
          <ExchangeCardModal
            availableCards={exchangeData.availableCards}
            cardsToKeep={exchangeData.cardsToKeep}
            onSelect={exchangeCardChoice}
          />
        )}

        {/* BlockCard Modal */}
        {showBlockCardModal && blockCardData && (
          <BlockCardModal
            availableCards={blockCardData.availableCards}
            actionToBlock={blockCardData.actionToBlock}
            onSelect={blockCardChoice}
          />
        )}

        {/* Game Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board and Players */}
          <div className="lg:col-span-3">
            <SimpleGameBoard
              players={transformedPlayers}
              currentTurnPlayerId={state.currentTurnPlayerId}
              currentPlayerId={currentPlayer.playerId}
            />
          </div>

          {/* Action Log Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600 p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">
                Game Log
              </h3>
              <ActionLogPanel
                logs={state.actionLogs || []}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-6">
          <ResponsiveActionPanel
            myPlayerState={
              transformedPlayers.find(
                (p) => p.playerId === currentPlayer.playerId,
              ) || null
            }
            isMyTurn={isMyTurn}
            selectedTarget={selectedTarget}
            aliveOpponents={aliveOpponents.map(
              (p) =>
                transformedPlayers.find((tp) => tp.playerId === p.playerId) ||
                (p as CoupPlayerExtended),
            )}
            pendingAction={state.pendingAction || null}
            setSelectedTarget={setSelectedTarget}
            onActionClick={onActionClick}
            onBlock={onBlock}
            onChallenge={onChallenge}
            onResolve={onResolve}
            players={transformedPlayers}
            currentTurnPlayerId={state.currentTurnPlayerId}
          />
        </div>
      </div>
    </div>
  );
}

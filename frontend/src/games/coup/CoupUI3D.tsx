// src/games/coup/CoupUI3D.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCoupGame } from "./hooks/useCoupGame";
import { GameBoard3D } from "./components/GameBoard3D";
import { ResponsiveActionPanel } from "./components/ResponsiveActionPanel";
// import WinnerBanner from "./components/WinnerBanner";
import { Enhanced3DStyles } from "./styles/Enhanced3DStyles";
import {
  type CoupPlayerExtended,
  type InfluenceCard,
  InfluenceType,
} from "./types/cards.types";
import LoseCardModal from "./components/LoseCardModal";
import ExchangeCardModal from "./components/ExchangeCardModal";
import BlockCardModal from "./components/BlockCardModal";

/**
 * CoupUI3D - Enhanced 3D immersive Coup game interface
 *
 * Features:
 * - Full 3D perspective game board with proper depth
 * - Individual influence cards with beautiful SVG designs
 * - Responsive design that works on mobile, tablet, and desktop
 * - Smooth animations and transitions
 * - Accessibility features and reduced motion support
 * - Performance optimized with GPU acceleration
 */
export default function CoupUI3D(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [deviceOrientation, setDeviceOrientation] = useState<
    "portrait" | "landscape"
  >("portrait");

  // Custom hook for game state management
  const {
    state,
    currentPlayer,
    myPlayerState,
    isMyTurn,
    aliveOpponents,
    error,
    selectedTarget,
    animateCoin,
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

  const [transformedPlayers, setTransformedPlayers] = useState<
    CoupPlayerExtended[]
  >([]);

  const [winner, setWinner] = useState<string | null>(null);

  // Handle device orientation for mobile optimization
  useEffect(() => {
    const handleOrientationChange = () => {
      setDeviceOrientation(
        window.innerWidth > window.innerHeight ? "landscape" : "portrait",
      );
    };

    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  // Loading timeout
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state) {
      // Transform players to include influence cards and positions
      console.log("Transforming players with influences", {
        players: state.players,
      });
      const playersWithInfluences = state.players.map((player, index) => ({
        ...player,
        position: index,
        influences: [
          ...(player.influence?.map((influence) =>
            generateInfluences(
              player.playerId,
              currentPlayer.playerId === player.playerId,
              influence,
            ),
          ) || []),
          ...(player.revealedCards?.map((influence) =>
            generateInfluences(
              player.playerId,
              currentPlayer.playerId === player.playerId,
              influence,
              true, // Always revealed for revealed cards
            ),
          ) || []),
        ],
      }));
      console.log(
        "Transforming players with influences",
        playersWithInfluences,
        state,
      );
      setTransformedPlayers([...playersWithInfluences]);
    }
  }, [state, currentPlayer.playerId]);

  useEffect(() => {
    if (state?.winner) {
      console.log("Setting winner based on state", state.winner);
      const winnerPlayer = transformedPlayers.find(
        (p) => p.playerId === state.winner,
      );
      if (winnerPlayer) {
        setWinner(winnerPlayer.playerId);
      }
    }
  }, [state?.winner, transformedPlayers]);

  // Generate influences for demonstration
  function generateInfluences(
    playerId: string,
    isCurrentPlayer: boolean,
    type: string,
    isRevealed: boolean = false,
  ): InfluenceCard {
    console.log("Generating influence for", {
      playerId,
      type,
      isCurrentPlayer,
    });
    switch (type.toUpperCase()) {
      case InfluenceType.DUKE:
        return {
          id: `${playerId}-duke`,
          type: InfluenceType.DUKE,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case InfluenceType.ASSASSIN:
        return {
          id: `${playerId}-assassin`,
          type: InfluenceType.ASSASSIN,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case InfluenceType.CAPTAIN:
        return {
          id: `${playerId}-captain`,
          type: InfluenceType.CAPTAIN,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case InfluenceType.CONTESSA:
        return {
          id: `${playerId}-contessa`,
          type: InfluenceType.CONTESSA,
          isRevealed: isRevealed,
          isLost: isRevealed,
        };
      case InfluenceType.AMBASSADOR:
        return {
          id: `${playerId}-ambassador`,
          type: InfluenceType.AMBASSADOR,
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
  // Loading state with 3D spinner
  if (!state || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-black flex items-center justify-center">
        <style dangerouslySetInnerHTML={{ __html: Enhanced3DStyles }} />
        <div className="text-center text-white">
          <div className="loading-3d w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-6"></div>
          <div className="text-3d-large font-bold mb-2">COUP</div>
          <div className="text-3d-medium text-blue-300 mb-4">
            Connecting to game...
          </div>
          <div className="text-3d-small text-gray-400">Room: {roomId}</div>

          {/* Loading particles */}
          <div className="atmosphere-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${6 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject Enhanced 3D Styles */}
      <style dangerouslySetInnerHTML={{ __html: Enhanced3DStyles }} />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-black relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="atmosphere-particles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Main Game Layout */}
        <div className="relative z-10 min-h-screen">
          {/* Winner Celebration */}
          {winner && (
            <div className="winner-celebration-3d">
              <WinnerBanner state={state} />
            </div>
          )}
          <>
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
            {/* Game Board Area */}
            <div
              className={`${
                deviceOrientation === "portrait" ? "pb-80" : "pb-40"
              } lg:pb-0`}>
              <div className="container mx-auto px-4 py-4 lg:py-8">
                {/* Error Display */}
                {error && (
                  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 backdrop-blur-sm border border-red-500/50 rounded-lg px-4 py-2 text-red-200 text-sm shadow-hard-3d animate-pulse">
                    ⚠️ {error}
                  </div>
                )}

                {/* 3D Game Board */}
                <GameBoard3D
                  players={transformedPlayers}
                  currentTurnPlayerId={state.currentTurnPlayerId}
                  currentPlayerId={currentPlayer.playerId}
                  animateCoin={animateCoin}
                />

                {/* Turn Indicator (Mobile) */}
                <div className="lg:hidden mt-4 text-center">
                  <div className="inline-block bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">
                        {
                          transformedPlayers.find(
                            (p) => p.playerId === state.currentTurnPlayerId,
                          )?.name
                        }
                        's Turn
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Responsive Action Panel */}
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
            />
          </>
        </div>

        {/* Global Coin Animation Fallback */}
        {animateCoin && (
          <div className="fixed right-6 bottom-32 lg:bottom-8 pointer-events-none z-40 depth-layer-5">
            <div className="coin-fly bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-4 py-2 rounded-full shadow-hard-3d">
              {animateCoin.amount > 0
                ? `+${animateCoin.amount} 🪙`
                : `${animateCoin.amount} 🪙`}
            </div>
          </div>
        )}

        {/* Accessibility Announcements */}
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          role="status">
          {error && `Error: ${error}`}
          {state.pendingAction &&
            `Pending action: ${state.pendingAction.type} by ${
              transformedPlayers.find(
                (p) => p.playerId === state.pendingAction?.fromPlayerId,
              )?.name
            }`}
          {winner && `Game over! Winner: ${winner.name}`}
          {isMyTurn && "It's your turn"}
        </div>

        {/* Performance Monitor (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white z-50">
            <div>Players: {transformedPlayers.length}</div>
            <div>
              FPS: {Math.round(60)}{" "}
              {/* Would integrate with actual FPS counter */}
            </div>
            <div>Orientation: {deviceOrientation}</div>
          </div>
        )}

        {/* Mobile Orientation Helper */}
        {deviceOrientation === "portrait" && window.innerWidth < 768 && (
          <div className="fixed top-4 right-4 bg-blue-900/80 backdrop-blur-sm rounded-lg px-3 py-2 text-blue-200 text-xs z-40">
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>Rotate for better view</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// src/games/coup/CoupUIDemo.tsx
import { SimpleGameBoard } from "./components/SimpleGameBoard";
import { ResponsiveActionPanel } from "./components/ResponsiveActionPanel";
import { ActionLogPanel } from "./components/ActionLogPanel";
import {
  type CoupPlayerExtended,
  InfluenceType,
} from "./types/cards.types";

/**
 * CoupUIDemo - Demo of the simplified Coup UI for design validation
 */
export default function CoupUIDemo(): JSX.Element {
  // Mock data for demonstration
  const mockPlayers: CoupPlayerExtended[] = [
    {
      playerId: "player1",
      name: "Alice",
      coins: 3,
      isAlive: true,
      influences: [
        { id: "1", type: InfluenceType.DUKE, isRevealed: false, isLost: false },
        { id: "2", type: InfluenceType.CAPTAIN, isRevealed: false, isLost: false },
      ],
    },
    {
      playerId: "player2", 
      name: "Bob",
      coins: 7,
      isAlive: true,
      influences: [
        { id: "3", type: InfluenceType.ASSASSIN, isRevealed: false, isLost: false },
        { id: "4", type: InfluenceType.CONTESSA, isRevealed: true, isLost: true },
      ],
    },
    {
      playerId: "player3",
      name: "Charlie",
      coins: 2,
      isAlive: true,
      influences: [
        { id: "5", type: InfluenceType.AMBASSADOR, isRevealed: false, isLost: false },
        { id: "6", type: InfluenceType.DUKE, isRevealed: false, isLost: false },
      ],
    },
    {
      playerId: "player4",
      name: "Diana",
      coins: 0,
      isAlive: false,
      influences: [
        { id: "7", type: InfluenceType.CAPTAIN, isRevealed: true, isLost: true },
        { id: "8", type: InfluenceType.CONTESSA, isRevealed: true, isLost: true },
      ],
    },
  ];

  const mockLogs = [
    {
      id: "1",
      timestamp: Date.now() - 60000,
      playerName: "Alice",
      action: "Income",
      outcome: "Alice performed Income",
      turnNumber: 1,
    },
    {
      id: "2", 
      timestamp: Date.now() - 45000,
      playerName: "Bob",
      action: "Tax",
      outcome: "Bob performed Tax (Duke)",
      turnNumber: 2,
    },
    {
      id: "3",
      timestamp: Date.now() - 30000,
      playerName: "Charlie",
      action: "Coup",
      target: "Diana",
      outcome: "Charlie couped Diana",
      turnNumber: 3,
    },
    {
      id: "4",
      timestamp: Date.now() - 15000,
      playerName: "Alice",
      action: "Foreign Aid",
      outcome: "Alice performed Foreign Aid",
      turnNumber: 4,
    },
  ];

  const currentPlayerId = "player1"; // Alice
  const currentTurnPlayerId = "player1"; // Alice's turn

  const mockHandlers = {
    setSelectedTarget: (target: string | null) => {
      console.log("Target selected:", target);
    },
    onActionClick: (type: string) => {
      console.log("Action clicked:", type);
    },
    onBlock: () => {
      console.log("Block clicked");
    },
    onChallenge: () => {
      console.log("Challenge clicked");
    },
    onResolve: () => {
      console.log("Resolve clicked");
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Main Game Layout */}
      <div className="container mx-auto px-4 py-6">
        
        {/* Demo Banner */}
        <div className="mb-6 p-4 bg-blue-900/40 backdrop-blur-sm rounded-xl border border-blue-500/40 text-center">
          <h1 className="text-2xl font-bold text-blue-300 mb-2">Coup UI - Simplified Design Demo</h1>
          <p className="text-blue-200 text-sm">Clean, minimal interface with clear sections for better UX</p>
        </div>

        {/* Game Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board and Players */}
          <div className="lg:col-span-3">
            <SimpleGameBoard
              players={mockPlayers}
              currentTurnPlayerId={currentTurnPlayerId}
              currentPlayerId={currentPlayerId}
            />
          </div>

          {/* Action Log Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600 p-4">
              <h3 className="text-white font-semibold mb-3 text-sm">Game Log</h3>
              <ActionLogPanel 
                logs={mockLogs}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-6">
          <ResponsiveActionPanel
            myPlayerState={mockPlayers.find(p => p.playerId === currentPlayerId) || null}
            isMyTurn={true}
            selectedTarget={null}
            aliveOpponents={mockPlayers.filter(p => p.playerId !== currentPlayerId && p.isAlive)}
            pendingAction={null}
            setSelectedTarget={mockHandlers.setSelectedTarget}
            onActionClick={mockHandlers.onActionClick}
            onBlock={mockHandlers.onBlock}
            onChallenge={mockHandlers.onChallenge}
            onResolve={mockHandlers.onResolve}
            players={mockPlayers}
            currentTurnPlayerId={currentTurnPlayerId}
          />
        </div>
      </div>
    </div>
  );
}
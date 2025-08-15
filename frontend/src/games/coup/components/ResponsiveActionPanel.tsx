// src/games/coup/components/ResponsiveActionPanel.tsx
import React, { useState } from "react";
import type { CoupPlayerExtended } from "../types/cards.types";
import type {
  PendingAction,
  ACTION_COSTS,
  ACTIONS_REQUIRING_TARGET,
} from "../types/coup.types";
import { ActionType } from "../types/coup.types";
import { InfluenceCard } from "./InfluenceCard";

interface ResponsiveActionPanelProps {
  myPlayerState: CoupPlayerExtended | null;
  isMyTurn: boolean;
  selectedTarget: string | null;
  aliveOpponents: CoupPlayerExtended[];
  pendingAction: PendingAction | null;
  setSelectedTarget: (target: string | null) => void;
  onActionClick: (type: string) => void;
  onBlock: () => void;
  onChallenge: () => void;
  onResolve: () => void;
  players: CoupPlayerExtended[];
}

export const ResponsiveActionPanel: React.FC<ResponsiveActionPanelProps> = ({
  myPlayerState,
  isMyTurn,
  selectedTarget,
  aliveOpponents,
  pendingAction,
  setSelectedTarget,
  onActionClick,
  onBlock,
  onChallenge,
  onResolve,
  players,
}) => {
  const [activeTab, setActiveTab] = useState<"actions" | "cards" | "info">(
    "actions",
  );
  const [showActionDetails, setShowActionDetails] = useState(false);

  const coins = myPlayerState?.coins || 0;
  const isAlive = myPlayerState?.isAlive || false;
  const canAct = isMyTurn && isAlive && !pendingAction;
  const myInfluences =
    myPlayerState?.influences?.filter((card) => !card.isRevealed) || [];

  const actionCategories = [
    {
      title: "Basic Actions",
      icon: "💰",
      actions: [
        {
          type: ActionType.INCOME,
          name: "Income",
          description: "Take 1 coin from the treasury",
          icon: "💰",
          cost: 0,
          color: "bg-blue-600 hover:bg-blue-500",
        },
        {
          type: ActionType.FOREIGN_AID,
          name: "Foreign Aid",
          description: "Take 2 coins (can be blocked by Duke)",
          icon: "🏛️",
          cost: 0,
          color: "bg-indigo-600 hover:bg-indigo-500",
        },
      ],
    },
    {
      title: "Character Powers",
      icon: "👑",
      actions: [
        {
          type: ActionType.TAX,
          name: "Tax",
          description: "Take 3 coins (Duke power)",
          icon: "👑",
          cost: 0,
          color: "bg-purple-600 hover:bg-purple-500",
          character: "DUKE",
        },
        {
          type: ActionType.STEAL,
          name: "Steal",
          description: "Take 2 coins from target (Captain)",
          icon: "🏴‍☠️",
          cost: 0,
          color: "bg-cyan-600 hover:bg-cyan-500",
          character: "CAPTAIN",
          needsTarget: true,
        },
        {
          type: ActionType.ASSASSINATE,
          name: "Assassinate",
          description: "Pay 3 to eliminate target (Assassin)",
          icon: "⚔️",
          cost: 3,
          color: "bg-red-600 hover:bg-red-500",
          character: "ASSASSIN",
          needsTarget: true,
        },
        {
          type: ActionType.EXCHANGE,
          name: "Exchange",
          description: "Swap cards with deck (Ambassador)",
          icon: "🔄",
          cost: 0,
          color: "bg-green-600 hover:bg-green-500",
          character: "AMBASSADOR",
        },
      ],
    },
    {
      title: "Forced Actions",
      icon: "⚔️",
      actions: [
        {
          type: ActionType.COUP,
          name: "Coup",
          description: "Pay 7 to eliminate target (cannot be blocked)",
          icon: "⚔️",
          cost: 7,
          color: "bg-orange-600 hover:bg-orange-500",
          needsTarget: true,
        },
      ],
    },
  ];

  const renderActionButton = (action: any) => {
    const disabled =
      !canAct || action.cost > coins || (action.needsTarget && !selectedTarget);

    return (
      <button
        key={action.type}
        onClick={() => onActionClick(action.type)}
        disabled={disabled}
        className={`
          relative w-full p-3 rounded-lg text-white font-semibold 
          transition-all duration-200 transform
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105 active:scale-95"
          }
          ${action.color}
          shadow-lg hover:shadow-xl
        `}
        title={
          action.description +
          (action.cost > 0 ? ` (Cost: ${action.cost} coins)` : "")
        }>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{action.icon}</span>
            <div className="text-left">
              <div className="font-bold">{action.name}</div>
              {action.cost > 0 && (
                <div className="text-xs opacity-90">Cost: {action.cost}</div>
              )}
            </div>
          </div>

          {action.needsTarget && (
            <div className="text-xs bg-white/20 px-2 py-1 rounded">
              Target Required
            </div>
          )}

          {action.character && (
            <div className="text-xs bg-black/20 px-2 py-1 rounded">
              {action.character}
            </div>
          )}
        </div>

        {disabled && action.needsTarget && !selectedTarget && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <span className="text-xs text-red-300">Select Target</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto bg-slate-900/95 lg:bg-slate-800 backdrop-blur-sm lg:backdrop-blur-none border-t lg:border lg:border-slate-600 rounded-t-2xl lg:rounded-2xl shadow-2xl z-50">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-slate-700">
        {[
          { id: "actions", label: "Actions", icon: "⚡" },
          { id: "cards", label: "Cards", icon: "🃏" },
          { id: "info", label: "Info", icon: "ℹ️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400 bg-blue-900/20"
                : "text-gray-400 hover:text-gray-200"
            }`}>
            <div className="text-lg">{tab.icon}</div>
            <div className="text-xs mt-1">{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="max-h-[60vh] lg:max-h-none overflow-y-auto p-4 space-y-4">
        {/* Pending Action Banner */}
        {pendingAction &&
          myPlayerState?.playerId != pendingAction.fromPlayerId && (
            <div className="p-4 bg-gradient-to-r from-yellow-900/50 to-red-900/50 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="font-bold text-yellow-300">
                    ⏳ {pendingAction.type}
                  </div>
                  <div className="text-sm text-gray-300">
                    by{" "}
                    {
                      players.find(
                        (p) => p.playerId === pendingAction.fromPlayerId,
                      )?.name
                    }
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onBlock}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold text-sm">
                    🛡️ Block
                  </button>
                  <button
                    onClick={onChallenge}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-sm">
                    ⚔️ Challenge
                  </button>
                  <button
                    onClick={onResolve}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-sm">
                    ✓ Resolve
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Player Status (Always Visible on Desktop) */}
        <div className={`${activeTab !== "actions" && "lg:block hidden"}`}>
          <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Your Status</h3>
              <div
                className={`px-2 py-1 rounded text-xs font-bold ${
                  isAlive ? "bg-green-600 text-white" : "bg-red-600 text-white"
                }`}>
                {isAlive ? "ALIVE" : "ELIMINATED"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl text-yellow-400">🪙</div>
                <div className="text-xl font-bold text-white">{coins}</div>
                <div className="text-xs text-gray-400">Coins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-red-400">❤️</div>
                <div className="text-xl font-bold text-white">
                  {myInfluences.length}
                </div>
                <div className="text-xs text-gray-400">Influences</div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Selection */}
        {(activeTab === "actions" || !activeTab) && (
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Player
            </label>
            <select
              value={selectedTarget || ""}
              onChange={(e) => setSelectedTarget(e.target.value || null)}
              className="w-full p-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
              disabled={!canAct || aliveOpponents.length === 0}>
              <option value="">Select target...</option>
              {aliveOpponents.map((opponent) => (
                <option key={opponent.playerId} value={opponent.playerId}>
                  {opponent.name} ({opponent.coins} coins,{" "}
                  {opponent.influences?.filter((c) => !c.isLost).length || 0}{" "}
                  influences)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions Tab */}
        {(activeTab === "actions" || !activeTab) && (
          <div className="space-y-4">
            {actionCategories.map((category) => (
              <div key={category.title}>
                <h4 className="flex items-center gap-2 font-semibold text-gray-300 mb-2">
                  <span>{category.icon}</span>
                  {category.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.actions.map(renderActionButton)}
                </div>
              </div>
            ))}

            {/* Warnings */}
            {coins >= 10 && (
              <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                <div className="text-red-300 font-bold text-sm">
                  ⚠️ You must Coup! (10+ coins)
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === "cards" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Your Influence Cards</h4>
            <div className="flex justify-center gap-4">
              {myInfluences.map((influence, index) => (
                <div
                  key={influence.id}
                  className="transform hover:scale-110 transition-transform">
                  <InfluenceCard
                    card={influence}
                    isMyCard={true}
                    size="large"
                  />
                </div>
              ))}
            </div>

            {myInfluences.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-2">💀</div>
                <div>All influences eliminated</div>
              </div>
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Game Rules</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <div>• Each player starts with 2 influence cards and 2 coins</div>
              <div>• Lose all influences = eliminated</div>
              <div>• Must Coup at 10+ coins</div>
              <div>• Actions can be blocked or challenged</div>
              <div>• Last player standing wins!</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar (Mobile) */}
      <div className="lg:hidden border-t border-slate-700 p-2">
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => onActionClick(ActionType.INCOME)}
            disabled={!canAct}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded font-bold text-white text-xs">
            💰 Income
          </button>
          <button
            onClick={() => onActionClick(ActionType.FOREIGN_AID)}
            disabled={!canAct}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded font-bold text-white text-xs">
            🏛️ Aid
          </button>
          <button
            onClick={() => onActionClick(ActionType.COUP)}
            disabled={!canAct || coins < 7 || !selectedTarget}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded font-bold text-white text-xs">
            ⚔️ Coup
          </button>
        </div>
      </div>
    </div>
  );
};

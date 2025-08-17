// src/games/monopoly/MonopolyGame.ts
// Simplified stub implementation to satisfy interface - not a working game

import { IGame, GameAction, GameState } from "../IGame";
import { Player } from "../../rooms";

// Simplified Monopoly-specific game state
export interface MonopolyGameState extends GameState {
    players: Player[];
    currentTurnPlayerId: string;
    board: any[]; // Simplified - not implementing full board logic
    dice: [number, number];
}

export class MonopolyGame implements IGame {
    gameId = "monopoly";
    onEvent: ((roomId: string | string[], event: any, payload: any) => void) | undefined;

    initGame(roomId: string, players: Player[]): MonopolyGameState {
        return {
            players,
            currentTurnPlayerId: players[0]?.playerId || "",
            board: [], // Simplified
            dice: [1, 1],
        };
    }

    validateAction(action: GameAction, state: MonopolyGameState): boolean {
        // Simplified validation - always return false since this isn't implemented
        return false;
    }

    handleAction(roomId: string, action: GameAction, state: MonopolyGameState): MonopolyGameState {
        // Simplified - just return current state since this isn't implemented
        return state;
    }
}
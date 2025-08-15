import { Player } from "../rooms"; // Assuming you have a Player type

export interface GameAction {
    type: string; // e.g., 'rollDice', 'buyProperty', etc.
    payload?: any;
    playerId: string;
}

export interface GameState {
    // generic shape - each game can extend this
    players: Player[];
    currentTurnPlayerId: string;
    // ...game specific state goes here
}

export interface IGame {
    gameId: string; // e.g. "monopoly", "catan"

    // Initialize game state for a room with players
    initGame(roomId: string, players: Player[]): GameState;

    // Validate if a given action is allowed
    validateAction(action: GameAction, state: GameState): boolean;

    // Apply an action and return updated game state
    handleAction(roomId: string, action: GameAction, state: GameState): GameState;
}

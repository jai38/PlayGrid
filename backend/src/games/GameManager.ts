import { Server, Socket } from "socket.io";
import { IGame, GameAction, GameState } from "./IGame";

interface GameInstance {
    game: IGame;
    state: GameState;
    lastActivity: number;
    roomId: string;
}

export class GameManager {
    private io: Server;
    // Map roomId -> game instance
    private activeGames: Map<string, GameInstance> = new Map();

    // Registry of all available games keyed by gameId
    private gameRegistry: Map<string, IGame> = new Map();

    // Configuration
    private readonly GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

    constructor(io: Server) {
        this.io = io;
        this.startCleanupTimer();
    }

    registerGame(game: IGame): void {
        this.gameRegistry.set(game.gameId, game);
        console.log(`Registered game: ${game.gameId}`);
    }

    startGame(roomId: string, gameId: string, players: any[]): GameState {
        const game = this.gameRegistry.get(gameId);
        if (!game) {
            throw new Error(`Game ${gameId} not found`);
        }

        // Check if game already exists
        if (this.activeGames.has(roomId)) {
            throw new Error(`Game already active in room ${roomId}`);
        }

        const state = game.initGame(roomId, players);
        const gameInstance: GameInstance = {
            game,
            state,
            lastActivity: Date.now(),
            roomId
        };

        this.activeGames.set(roomId, gameInstance);
        console.log(`Game ${gameId} started in room ${roomId} with ${players.length} players`);

        return state;
    }

    handleAction(roomId: string, action: GameAction): GameState {
        const gameInstance = this.activeGames.get(roomId);
        if (!gameInstance) {
            throw new Error(`No active game in room ${roomId}`);
        }

        const { game, state } = gameInstance;

        // Validate action
        if (!game.validateAction(action, state)) {
            throw new Error(`Invalid action: ${action.type}`);
        }

        // Update last activity
        gameInstance.lastActivity = Date.now();

        // Handle the action
        const newState = game.handleAction(roomId, action, state);
        gameInstance.state = newState;

        // Update the game instance
        this.activeGames.set(roomId, gameInstance);

        return newState;
    }

    endGame(roomId: string): void {
        const gameInstance = this.activeGames.get(roomId);
        if (gameInstance) {
            console.log(`Ending game in room ${roomId}`);
            this.activeGames.delete(roomId);
            this.io.to(roomId).emit("game:ended");
        }
    }

    getGameState(roomId: string): GameState | undefined {
        const gameInstance = this.activeGames.get(roomId);
        if (gameInstance) {
            // Update last activity on access
            gameInstance.lastActivity = Date.now();
            return gameInstance.state;
        }
        return undefined;
    }

    getGameInstance(roomId: string): IGame | undefined {
        const gameInstance = this.activeGames.get(roomId);
        return gameInstance?.game;
    }

    isGameActive(roomId: string): boolean {
        return this.activeGames.has(roomId);
    }

    getActiveGamesCount(): number {
        return this.activeGames.size;
    }

    getGameInfo(roomId: string): { gameId: string; playerCount: number; lastActivity: number } | null {
        const gameInstance = this.activeGames.get(roomId);
        if (!gameInstance) return null;

        return {
            gameId: gameInstance.game.gameId,
            playerCount: gameInstance.state.players?.length || 0,
            lastActivity: gameInstance.lastActivity
        };
    }

    private startCleanupTimer(): void {
        setInterval(() => {
            this.performCleanup();
        }, this.CLEANUP_INTERVAL);
    }

    private performCleanup(): void {
        const now = Date.now();
        const gamesToRemove: string[] = [];

        for (const [roomId, gameInstance] of this.activeGames.entries()) {
            if (now - gameInstance.lastActivity > this.GAME_TIMEOUT) {
                gamesToRemove.push(roomId);
            }
        }

        if (gamesToRemove.length > 0) {
            console.log(`Cleaning up ${gamesToRemove.length} inactive games`);
            gamesToRemove.forEach(roomId => {
                this.endGame(roomId);
            });
        }
    }

    public cleanupGame(roomId: string): void {
        const gameInstance = this.activeGames.get(roomId);
        if (gameInstance) {
            console.log(`Cleaning up game in room ${roomId}`);
            this.activeGames.delete(roomId);
            this.io.to(roomId).emit("game:cleaned");
        }
    }

    // Public method for manual cleanup
    public cleanupInactiveGames(): void {
        this.performCleanup();
    }

    // Get statistics for monitoring
    getStats(): {
        activeGames: number;
        registeredGames: number;
        totalPlayers: number;
    } {
        let totalPlayers = 0;
        for (const gameInstance of this.activeGames.values()) {
            totalPlayers += gameInstance.state.players?.length || 0;
        }

        return {
            activeGames: this.activeGames.size,
            registeredGames: this.gameRegistry.size,
            totalPlayers
        };
    }
}

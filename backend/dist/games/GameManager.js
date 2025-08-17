"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
class GameManager {
    constructor(io) {
        // Map roomId -> game instance
        this.activeGames = new Map();
        // Registry of all available games keyed by gameId
        this.gameRegistry = new Map();
        // Configuration
        this.GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        this.CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.io = io;
        this.startCleanupTimer();
    }
    registerGame(game) {
        this.gameRegistry.set(game.gameId, game);
        console.log(`Registered game: ${game.gameId}`);
    }
    startGame(roomId, gameId, players) {
        const game = this.gameRegistry.get(gameId);
        if (!game) {
            throw new Error(`Game ${gameId} not found`);
        }
        // Check if game already exists
        if (this.activeGames.has(roomId)) {
            throw new Error(`Game already active in room ${roomId}`);
        }
        const state = game.initGame(roomId, players);
        const gameInstance = {
            game,
            state,
            lastActivity: Date.now(),
            roomId
        };
        this.activeGames.set(roomId, gameInstance);
        console.log(`Game ${gameId} started in room ${roomId} with ${players.length} players`);
        return state;
    }
    handleAction(roomId, action) {
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
    endGame(roomId) {
        const gameInstance = this.activeGames.get(roomId);
        if (gameInstance) {
            console.log(`Ending game in room ${roomId}`);
            this.activeGames.delete(roomId);
            this.io.to(roomId).emit("game:ended");
        }
    }
    getGameState(roomId) {
        const gameInstance = this.activeGames.get(roomId);
        if (gameInstance) {
            // Update last activity on access
            gameInstance.lastActivity = Date.now();
            return gameInstance.state;
        }
        return undefined;
    }
    getGameInstance(roomId) {
        const gameInstance = this.activeGames.get(roomId);
        return gameInstance?.game;
    }
    isGameActive(roomId) {
        return this.activeGames.has(roomId);
    }
    getActiveGamesCount() {
        return this.activeGames.size;
    }
    getGameInfo(roomId) {
        const gameInstance = this.activeGames.get(roomId);
        if (!gameInstance)
            return null;
        return {
            gameId: gameInstance.game.gameId,
            playerCount: gameInstance.state.players?.length || 0,
            lastActivity: gameInstance.lastActivity
        };
    }
    startCleanupTimer() {
        setInterval(() => {
            this.performCleanup();
        }, this.CLEANUP_INTERVAL);
    }
    performCleanup() {
        const now = Date.now();
        const gamesToRemove = [];
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
    // Public method for manual cleanup
    cleanupInactiveGames() {
        this.performCleanup();
    }
    // Get statistics for monitoring
    getStats() {
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
exports.GameManager = GameManager;

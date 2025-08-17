"use strict";
// src/games/monopoly/MonopolyGame.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonopolyGame = void 0;
const MonopolyState_1 = require("./MonopolyState");
class MonopolyGame {
    constructor(playerNames = []) {
        this.gameId = "monopoly";
        // Store game states by roomId
        this.games = new Map();
        this.players = playerNames;
        this.currentPlayerIndex = 0;
        this.state = (0, MonopolyState_1.createInitialState)(this.players);
    }
    getState(roomId) {
        return this.games.get(roomId) || this.state;
    }
    // Initialize a new game for a room with players
    start(roomId, players) {
        const initialState = {
            players,
            currentTurn: 0,
            board: (0, MonopolyState_1.createInitialState)(players).board, // your board setup
            dice: [0, 0],
            diceTotal: 0,
            doublesCount: 0,
            // add any other monopoly-specific state fields here
        };
        this.games.set(roomId, initialState);
        this.state = initialState;
        return initialState;
    }
    // Handle incoming actions from players
    handleAction(roomId, action, state) {
        let state = this.games.get(roomId);
        if (!state) {
            throw new Error("Game not found");
        }
        switch (action.type) {
            case "ROLL_DICE":
                state = this.rollDice(state);
                break;
            case "MOVE_PLAYER":
                state = this.movePlayer(state);
                break;
            case "END_TURN":
                state = this.endTurn(state);
                break;
            case "BUY_PROPERTY":
                state = this.buyProperty(state);
                break;
            case "PAY_RENT":
                state = this.payRent(state);
                break;
            default:
                console.warn("Unknown action type:", action.type);
        }
        this.games.set(roomId, state);
        return state;
    }
    rollDice(state) {
        const die1 = this.randomDie();
        const die2 = this.randomDie();
        const total = die1 + die2;
        console.log(`Player ${this.getCurrentPlayerName(state)} rolled ${die1} and ${die2}`);
        let doublesCount = state.doublesCount || 0;
        if (die1 === die2) {
            doublesCount++;
            console.log("Doubles rolled! Count:", doublesCount);
            // TODO: Handle 3 doubles → jail
        }
        else {
            doublesCount = 0;
        }
        return {
            ...state,
            dice: [die1, die2],
            diceTotal: total,
            doublesCount,
        };
    }
    movePlayer(state) {
        const currentPlayerIndex = state.currentTurn;
        const player = state.players[currentPlayerIndex];
        if (!player)
            return state;
        const newPosition = (player.position + state.diceTotal) % state.board.length;
        const passedGo = newPosition < player.position;
        // Create updated player
        const updatedPlayer = { ...player, position: newPosition };
        if (passedGo) {
            updatedPlayer.money += 200; // Collect $200 passing Go
            console.log(`${player.name} passed GO and collected $200`);
        }
        // Update players array immutably
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayerIndex] = updatedPlayer;
        // TODO: Handle landing on tile (property, chance, jail, etc.)
        return {
            ...state,
            players: updatedPlayers,
        };
    }
    endTurn(state) {
        const nextPlayer = (state.currentTurn + 1) % state.players.length;
        console.log(`Turn ended. Next player: ${state.players[nextPlayer].name}`);
        return {
            ...state,
            currentTurn: nextPlayer,
            doublesCount: 0,
            dice: [0, 0],
            diceTotal: 0,
        };
    }
    buyProperty(state) {
        const currentPlayerIndex = state.currentTurn;
        const player = state.players[currentPlayerIndex];
        const tile = state.board[player.position];
        if (!tile || tile.owner !== null) {
            console.log("Cannot buy tile:", tile);
            return state;
        }
        if (player.money < tile.price) {
            console.log(`${player.name} does not have enough money to buy ${tile.name}`);
            return state;
        }
        // Deduct money from player
        const updatedPlayer = { ...player, money: player.money - tile.price };
        // Update tile ownership
        const updatedTile = { ...tile, owner: player.id };
        // Update board immutably
        const updatedBoard = [...state.board];
        updatedBoard[player.position] = updatedTile;
        // Update players array immutably
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayerIndex] = updatedPlayer;
        console.log(`${player.name} bought ${tile.name} for $${tile.price}`);
        return {
            ...state,
            players: updatedPlayers,
            board: updatedBoard,
        };
    }
    payRent(state) {
        const currentPlayerIndex = state.currentTurn;
        const player = state.players[currentPlayerIndex];
        const tile = state.board[player.position];
        if (!tile || tile.owner === null || tile.owner === player.id) {
            return state;
        }
        const ownerIndex = state.players.findIndex((p) => p.id === tile.owner);
        if (ownerIndex === -1)
            return state;
        const owner = state.players[ownerIndex];
        const rent = tile.rent || 0;
        if (player.money < rent) {
            console.log(`${player.name} cannot pay rent of $${rent} to ${owner.name}`);
            // TODO: Handle bankruptcy
            return state;
        }
        // Update players immutably
        const updatedPlayer = { ...player, money: player.money - rent };
        const updatedOwner = { ...owner, money: owner.money + rent };
        const updatedPlayers = [...state.players];
        updatedPlayers[currentPlayerIndex] = updatedPlayer;
        updatedPlayers[ownerIndex] = updatedOwner;
        console.log(`${player.name} paid $${rent} rent to ${owner.name}`);
        return {
            ...state,
            players: updatedPlayers,
        };
    }
    getCurrentPlayerName(state) {
        return state.players[state.currentTurn]?.name || "Unknown";
    }
    randomDie() {
        return Math.floor(Math.random() * 6) + 1;
    }
    // Optional: clean up game state when game ends or room closes
    end(roomId) {
        this.games.delete(roomId);
    }
}
exports.MonopolyGame = MonopolyGame;

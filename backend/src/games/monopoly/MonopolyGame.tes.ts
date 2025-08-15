// // MonopolyGame.test.ts
// import { MonopolyGame } from "./MonopolyGame";
// import { GameManager } from "../GameManager";
// import { describe, beforeEach, test, expect, jest } from '@jest/globals';
// import { Player } from "./monopolyState";
// import { GameAction } from "../IGame";

// const players: string[] = [
//     "Alex", "Jordan"
// ];

// describe("MonopolyGame", () => {
//     let game: MonopolyGame;
//     const roomId = "test-room";

//     beforeEach(() => {
//         game = new MonopolyGame(["Alice", "Bob"]);
//         game.start(roomId, players);
//     });

//     test("start initializes game state correctly", () => {
//         const state = game.start(roomId, players);
//         expect(state.players.length).toBe(2);
//         expect(state.currentTurn).toBe(0);
//         expect(state.board.length).toBeGreaterThan(0);
//     });

//     test("rollDice returns dice values and updates doublesCount", () => {
//         const action: GameAction = { type: "ROLL_DICE", playerId: players[0] };
//         const state = game.handleAction(roomId, action);
//         expect(state.dice.length).toBe(2);
//         expect(state.diceTotal).toBe(state.dice[0] + state.dice[1]);
//         expect(game.getState(roomId).diceTotal).toBeGreaterThanOrEqual(0);
//     });

//     test("rollDice increments doublesCount on doubles", () => {
//         // Force dice to be doubles by mocking randomDie
//         jest.spyOn(game as any, "randomDie").mockReturnValue(3);
//         const state = game.handleAction(roomId, { type: "ROLL_DICE" });
//         expect(state.dice[0]).toBe(state.dice[1]);
//         expect(game.getState(roomId)["doublesCount"]).toBe(1);
//     });

//     test("movePlayer updates player position correctly and awards passing Go money", () => {
//         // Set diceTotal to 39 so player passes Go (board length assumed 40)
//         const currentState = game["games"].get(roomId);
//         currentState!.diceTotal = 39;
//         game["games"].set(roomId, currentState!);

//         const newState = game.handleAction(roomId, { type: "MOVE_PLAYER" });
//         const player = newState.players[game["currentPlayerIndex"]];
//         expect(player.position).toBe(39);
//         expect(player.money).toBe(1500); // No Go pass yet

//         // Move again with diceTotal=2 to pass Go
//         currentState!.diceTotal = 2;
//         currentState!.players[game["currentPlayerIndex"]].position = 39;
//         game["games"].set(roomId, currentState!);

//         const newState2 = game.handleAction(roomId, { type: "MOVE_PLAYER" });
//         const player2 = newState2.players[game["currentPlayerIndex"]];
//         expect(player2.position).toBe(1);
//         expect(player2.money).toBe(1700); // 1500 + 200 passing Go
//     });

//     test("endTurn cycles to next player and resets doublesCount and dice", () => {
//         const initialTurn = game["currentPlayerIndex"];
//         game.getState(roomId)["doublesCount"] = 2;
//         game.getState(roomId).dice = [4, 3];
//         game.getState(roomId).diceTotal = 7;

//         const newState = game.handleAction(roomId, { type: "END_TURN" });
//         expect(newState.currentTurn).toBe((initialTurn + 1) % players.length);
//         expect(game.getState(roomId)).toBe(0);
//         expect(newState.dice).toEqual([0, 0]);
//         expect(newState.diceTotal).toBe(0);
//     });

//     test("buyProperty lets player buy if enough money and tile available", () => {
//         // Setup tile for purchase at player's position
//         const state = game["games"].get(roomId);
//         const player = state!.players[game["currentPlayerIndex"]];
//         const tile = state!.board[player.position];
//         tile.owner = null;
//         tile.price = 100;

//         player.money = 1500;
//         game["games"].set(roomId, state!);

//         const newState = game.handleAction(roomId, { type: "BUY_PROPERTY" });
//         const updatedPlayer = newState.players[game["currentPlayerIndex"]];
//         const updatedTile = newState.board[updatedPlayer.position];
//         expect(updatedPlayer.money).toBe(1400);
//         expect(updatedTile.owner).toBe(updatedPlayer.id);
//     });

//     test("buyProperty fails if player lacks money or tile owned", () => {
//         const state = game["games"].get(roomId);
//         const player = state!.players[game["currentPlayerIndex"]];
//         const tile = state!.board[player.position];
//         tile.owner = null;
//         tile.price = 2000; // More than player money

//         player.money = 1500;
//         game["games"].set(roomId, state!);

//         const newState = game.handleAction(roomId, { type: "BUY_PROPERTY" });
//         expect(newState.players[game["currentPlayerIndex"]].money).toBe(1500);
//         expect(newState.board[player.position].owner).toBe(null);

//         // Now tile owned by someone else
//         tile.owner = "someOtherPlayerId";
//         game["games"].set(roomId, state!);
//         const newState2 = game.handleAction(roomId, { type: "BUY_PROPERTY" });
//         expect(newState2.board[player.position].owner).toBe("someOtherPlayerId");
//     });

//     test("payRent transfers money from player to owner", () => {
//         const state = game["games"].get(roomId);
//         const player = state!.players[game["currentPlayerIndex"]];
//         const tile = state!.board[player.position];
//         tile.owner = "p2";
//         tile.rent = 50;

//         const owner = state!.players.find((p: Player) => p.id === "p2");
//         if (owner) owner.money = 1000;

//         player.money = 1500;
//         game["games"].set(roomId, state!);

//         const newState = game.handleAction(roomId, { type: "PAY_RENT" });
//         const updatedPlayer = newState.players[game["currentPlayerIndex"]];
//         const updatedOwner = newState.players.find((p: Player) => p.id === "p2");

//         expect(updatedPlayer.money).toBe(1450);
//         expect(updatedOwner?.money).toBe(1050);
//     });

//     test("payRent does nothing if no owner or owner is player", () => {
//         const state = game["games"].get(roomId);
//         const player = state!.players[game["currentPlayerIndex"]];
//         const tile = state!.board[player.position];
//         tile.owner = null;

//         game["games"].set(roomId, state!);
//         let newState = game.handleAction(roomId, { type: "PAY_RENT" });
//         expect(newState).toEqual(state);

//         // Owner is same player
//         tile.owner = player.id;
//         game["games"].set(roomId, state!);
//         newState = game.handleAction(roomId, { type: "PAY_RENT" });
//         expect(newState).toEqual(state);
//     });

//     test("throws error for unknown action type", () => {
//         expect(() =>
//             game.handleAction(roomId, { type: "UNKNOWN_ACTION" } as GameAction)
//         ).not.toThrow();
//     });
// });

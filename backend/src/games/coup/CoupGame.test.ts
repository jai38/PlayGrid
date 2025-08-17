import { CoupGame, CoupGameState, CoupCard } from "./CoupGame";
import { Player } from "../../rooms";
import { GameAction } from "../IGame";

describe("CoupGame", () => {
    let game: CoupGame;
    let players: Player[];
    let state: CoupGameState;

    beforeEach(() => {
        game = new CoupGame();
        players = [
            {
                playerId: "P1", name: "Alice",
                isHost: false,
                lastSeen: 0
            },
            {
                playerId: "P2", name: "Bob",
                isHost: false,
                lastSeen: 0
            },
            {
                playerId: "P3", name: "Charlie",
                isHost: false,
                lastSeen: 0
            }
        ];
        state = game.initGame("room1", players);
    });

    test("initGame should set up players, coins, and deck", () => {
        expect(state.players.length).toBe(3);
        state.players.forEach(p => {
            expect(p.coins).toBe(2);
            expect(p.influence.length).toBe(2);
            expect(p.isAlive).toBe(true);
        });
        expect(state.deck.length).toBe(15 - (3 * 2)); // total cards minus dealt
        expect(state.currentTurnPlayerId).toBe(players[0].playerId);
    });

    test("INCOME should give +1 coin and advance turn", () => {
        const action: GameAction = { type: "INCOME", playerId: "P1" };
        game.handleAction("room1", action, state);
        expect(state.players[0].coins).toBe(3);
        expect(state.currentTurnPlayerId).toBe("P2");
    });

    test("COUP should cost 7 coins and remove influence", () => {
        const p1 = state.players[0];
        p1.coins = 7;
        const targetId = state.players[1].playerId;
        const action: GameAction = { type: "COUP", playerId: p1.playerId, payload: { targetId } };
        game.handleAction("room1", action, state);
        expect(p1.coins).toBe(0);
        expect(state.players[1].influence.length).toBe(1);
    });

    test("ASSASSINATE should cost 3 coins and set pendingAction", () => {
        const p1 = state.players[0];
        p1.coins = 3;
        const targetId = state.players[1].playerId;
        const action: GameAction = { type: "ASSASSINATE", playerId: p1.playerId, payload: { targetId } };
        game.handleAction("room1", action, state);
        expect(p1.coins).toBe(0);
        expect(state.pendingAction).toEqual({
            type: "ASSASSINATE",
            fromPlayerId: "P1",
            toPlayerId: "P2"
        });
    });

    test("STEAL should set pendingAction", () => {
        const action: GameAction = { type: "STEAL", playerId: "P1", payload: { targetId: "P2" } };
        game.handleAction("room1", action, state);
        expect(state.pendingAction).toEqual({
            type: "STEAL",
            fromPlayerId: "P1",
            toPlayerId: "P2"
        });
    });

    test("EXCHANGE should set pendingAction", () => {
        const action: GameAction = { type: "EXCHANGE", playerId: "P1" };
        game.handleAction("room1", action, state);
        expect(state.pendingAction).toEqual({
            type: "EXCHANGE",
            fromPlayerId: "P1"
        });
    });

    test("BLOCK should attach blockedBy to pendingAction", () => {
        state.pendingAction = { type: "FOREIGN_AID", fromPlayerId: "P1" };
        const action: GameAction = { type: "BLOCK", playerId: "P2" };
        game.handleAction("room1", action, state);
        expect(state.pendingAction?.blockedBy).toBe("P2");
    });

    test("CHALLENGE should resolve correctly when claimed player has card", () => {
        state.pendingAction = { type: "TAX", fromPlayerId: "P1" };
        state.players[0].influence = ["Duke", "Captain"];
        game.handleAction("room1", { type: "CHALLENGE", playerId: "P2", payload: { targetId: "P1" } }, state);
        expect(state.players[1].influence.length).toBe(1); // challenger lost influence
    });

    test("CHALLENGE should resolve correctly when claimed player lacks card", () => {
        state.pendingAction = { type: "TAX", fromPlayerId: "P1" };
        state.players[0].influence = ["Captain", "Ambassador"];
        game.handleAction("room1", { type: "CHALLENGE", playerId: "P2", payload: { targetId: "P1" } }, state);
        expect(state.players[0].influence.length).toBe(1); // claimed player lost influence
        expect(state.pendingAction).toBeUndefined(); // action canceled
    });

    test("RESOLVE_ACTION should process pendingAction", () => {
        state.pendingAction = { type: "TAX", fromPlayerId: "P1" };
        const beforeCoins = state.players[0].coins;
        game.handleAction("room1", { type: "RESOLVE_ACTION", playerId: "P1" }, state);
        expect(state.players[0].coins).toBe(beforeCoins + 3);
        expect(state.pendingAction).toBeUndefined();
    });

    test("Player should lose influence and possibly die", () => {
        const targetId = state.players[1].playerId;
        state.players[1].influence = ["Duke"];
        // Lose influence
        (game as any).loseInfluence(state, targetId);
        expect(state.players[1].influence.length).toBe(0);
        expect(state.players[1].isAlive).toBe(false);
    });

    test("Game should detect winner", () => {
        state.players[1].isAlive = false;
        state.players[2].isAlive = false;
        (game as any).checkWinner(state);
        expect(state.winner).toBe("P1");
    });
});

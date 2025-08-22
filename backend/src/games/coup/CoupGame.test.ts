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
        const initialTurnPlayer = state.currentTurnPlayerId;
        const action: GameAction = { type: "COUP", playerId: p1.playerId, payload: { targetId } };
        game.handleAction("room1", action, state);
        expect(p1.coins).toBe(0);
        expect(state.players[1].influence.length).toBe(1);
        // Turn should advance after Coup
        expect(state.currentTurnPlayerId).not.toBe(initialTurnPlayer);
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
            toPlayerId: "P2",
            respondedPlayers: []
        });
    });

    test("STEAL should set pendingAction", () => {
        const action: GameAction = { type: "STEAL", playerId: "P1", payload: { targetId: "P2" } };
        game.handleAction("room1", action, state);
        expect(state.pendingAction).toEqual({
            type: "STEAL",
            fromPlayerId: "P1",
            toPlayerId: "P2",
            respondedPlayers: []
        });
    });

    test("EXCHANGE should set pendingAction", () => {
        const action: GameAction = { type: "EXCHANGE", playerId: "P1" };
        game.handleAction("room1", action, state);
        expect(state.pendingAction).toEqual({
            type: "EXCHANGE",
            fromPlayerId: "P1",
            respondedPlayers: []
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

    test("RESOLVE_ACTION should process pendingAction when all players respond", () => {
        state.pendingAction = { type: "TAX", fromPlayerId: "P1", respondedPlayers: [] };
        const beforeCoins = state.players[0].coins;
        
        // P2 resolves (doesn't challenge)
        game.handleAction("room1", { type: "RESOLVE_ACTION", playerId: "P2" }, state);
        expect(state.pendingAction?.respondedPlayers).toContain("P2");
        expect(state.players[0].coins).toBe(beforeCoins); // Not resolved yet
        
        // P3 resolves (doesn't challenge) - now all have responded
        game.handleAction("room1", { type: "RESOLVE_ACTION", playerId: "P3" }, state);
        expect(state.players[0].coins).toBe(beforeCoins + 3); // Now resolved
        expect(state.pendingAction).toBeUndefined();
    });

    test("Player should lose influence and possibly die", () => {
        const targetId = state.players[1].playerId;
        state.players[1].influence = ["Duke"];
        // Lose influence
        (game as any).loseInfluence("room1", state, targetId);
        expect(state.players[1].influence.length).toBe(0);
        expect(state.players[1].isAlive).toBe(false);
    });

    test("EXCHANGE_CARDS should allow player to select cards to keep", () => {
        // Set up exchange state
        state.exchangeCards = {
            playerId: "P1",
            cards: ["Duke", "Captain", "Ambassador", "Assassin"],
            toKeep: 2
        };
        
        const action: GameAction = { 
            type: "EXCHANGE_CARDS", 
            playerId: "P1", 
            payload: { selectedCards: ["Duke", "Ambassador"] } 
        };
        
        game.handleAction("room1", action, state);
        
        const player = state.players.find(p => p.playerId === "P1")!;
        expect(player.influence).toEqual(["Duke", "Ambassador"]);
        expect(state.exchangeCards).toBeUndefined();
        expect(state.pendingAction).toBeUndefined();
        expect(state.deck.length).toBe(11); // original 9 + 2 returned cards
    });

    test("EXCHANGE_CARDS should handle duplicate cards correctly", () => {
        // Set up exchange state with duplicate Dukes
        state.exchangeCards = {
            playerId: "P1",
            cards: ["Duke", "Duke", "Captain", "Ambassador"], // 2 Dukes
            toKeep: 2
        };
        
        // Player selects 2 Dukes (both copies)
        const action: GameAction = { 
            type: "EXCHANGE_CARDS", 
            playerId: "P1", 
            payload: { selectedCards: ["Duke", "Duke"] } 
        };
        
        game.handleAction("room1", action, state);

        const player = state.players.find(p => p.playerId === "P1")!;
        expect(player.influence).toEqual(["Duke", "Duke"]);
        expect(state.exchangeCards).toBeUndefined();
        expect(state.pendingAction).toBeUndefined();
        // The other 2 cards should be returned to deck
        expect(state.deck.length).toBe(11); // Original 9 cards + 2 returned cards
    });

    test("EXCHANGE_CARDS should reject invalid card selection", () => {
        // Set up exchange state
        state.exchangeCards = {
            playerId: "P1",
            cards: ["Duke", "Captain", "Ambassador", "Assassin"],
            toKeep: 2
        };
        
        const originalInfluence = [...state.players[0].influence];
        
        // Try to select too many cards
        const action: GameAction = { 
            type: "EXCHANGE_CARDS", 
            playerId: "P1", 
            payload: { selectedCards: ["Duke", "Ambassador", "Captain"] } 
        };
        
        game.handleAction("room1", action, state);
        
        // Should remain unchanged
        expect(state.players[0].influence).toEqual(originalInfluence);
        expect(state.exchangeCards).toBeDefined(); // Still pending
    });

    test("CHOOSE_BLOCK_CARD should set blocking card for STEAL", () => {
        // Set up pending STEAL action
        state.pendingAction = { 
            type: "STEAL", 
            fromPlayerId: "P1", 
            toPlayerId: "P2",
            respondedPlayers: []
        };
        
        const action: GameAction = { 
            type: "CHOOSE_BLOCK_CARD", 
            playerId: "P3", 
            payload: { blockingCard: "Captain" } 
        };
        
        game.handleAction("room1", action, state);
        
        expect(state.pendingAction?.blockedBy).toBe("P3");
        expect(state.pendingAction?.blockingCard).toBe("Captain");
        expect(state.pendingAction?.respondedPlayers).toEqual([]);
    });

    test("loseCard should only remove one card when player has duplicates", () => {
        // Set up player with duplicate cards
        const player = state.players.find(p => p.playerId === "P1")!;
        player.influence = ["Captain", "Captain"]; // Player has 2 Captains
        
        // Player loses one Captain
        game.loseCard("room1", state, "P1", "Captain");
        
        // Should only lose one Captain, not both
        expect(player.influence).toEqual(["Captain"]);
        expect(player.revealedCards).toEqual(["Captain"]);
        expect(player.isAlive).toBe(true);
    });

    test("Enhanced Challenge system should track responses properly", () => {
        // Set up pending TAX action
        state.pendingAction = { 
            type: "TAX", 
            fromPlayerId: "P1",
            respondedPlayers: []
        };
        
        // P2 resolves (doesn't challenge)
        game.handleAction("room1", { type: "RESOLVE_ACTION", playerId: "P2" }, state);
        expect(state.pendingAction?.respondedPlayers).toContain("P2");
        expect(state.pendingAction).toBeDefined(); // Still pending
        
        // P3 challenges
        state.players[0].influence = ["Captain", "Ambassador"]; // P1 doesn't have Duke
        game.handleAction("room1", { type: "CHALLENGE", playerId: "P3", payload: { targetId: "P1" } }, state);
        
        // Action should be canceled due to failed challenge
        expect(state.pendingAction).toBeUndefined();
        expect(state.players[0].influence.length).toBe(1); // P1 lost influence
    });

    test("Block challenge should work correctly", () => {
        // Set up blocked action
        state.pendingAction = { 
            type: "FOREIGN_AID", 
            fromPlayerId: "P1",
            blockedBy: "P2",
            blockingCard: "Duke",
            respondedPlayers: []
        };
        
        state.players[1].influence = ["Captain", "Ambassador"]; // P2 doesn't have Duke
        
        // P3 challenges the block
        game.handleAction("room1", { type: "CHALLENGE", playerId: "P3", payload: { targetId: "P2" } }, state);
        
        // Block should fail, action should continue
        expect(state.pendingAction?.blockedBy).toBeUndefined();
        expect(state.pendingAction?.blockingCard).toBeUndefined();
        expect(state.players[1].influence.length).toBe(1); // P2 lost influence
    });

    test("Game should detect winner", () => {
        state.players[1].isAlive = false;
        state.players[2].isAlive = false;
        (game as any).checkWinner(state);
        expect(state.winner).toBe("P1");
    });

    test("BLOCK should emit game:pendingAction event with BLOCK_PENDING_CHALLENGE", () => {
        // Mock the onEvent callback
        const mockOnEvent = jest.fn();
        game.onEvent = mockOnEvent;

        // Set up a pending FOREIGN_AID action
        state.pendingAction = { type: "FOREIGN_AID", fromPlayerId: "P1", respondedPlayers: [] };
        
        // Give P2 a Duke card to block with
        state.players[1].influence = ["Duke", "Captain"];

        // P2 blocks the FOREIGN_AID action
        const blockAction: GameAction = { type: "BLOCK", playerId: "P2" };
        game.handleAction("room1", blockAction, state);

        // Verify both events were emitted
        expect(mockOnEvent).toHaveBeenCalledWith("room1", "coup:blockAction", {
            action: "FOREIGN_AID",
            blockedBy: "P2",
            blockingCard: "Duke"
        });

        expect(mockOnEvent).toHaveBeenCalledWith("room1", "game:pendingAction", {
            type: "BLOCK_PENDING_CHALLENGE",
            action: "FOREIGN_AID",
            blockedBy: "P2",
            blockingCard: "Duke",
            originalAction: state.pendingAction
        });

        // Verify the state was updated with block information
        expect(state.pendingAction?.blockedBy).toBe("P2");
        expect(state.pendingAction?.blockingCard).toBe("Duke");
    });

    test("CHOOSE_BLOCK_CARD should emit game:pendingAction event with BLOCK_PENDING_CHALLENGE", () => {
        // Mock the onEvent callback
        const mockOnEvent = jest.fn();
        game.onEvent = mockOnEvent;

        // Set up a pending STEAL action
        state.pendingAction = { 
            type: "STEAL", 
            fromPlayerId: "P1", 
            toPlayerId: "P2",
            respondedPlayers: [] 
        };
        
        // P3 chooses to block with Captain
        const chooseBlockAction: GameAction = { 
            type: "CHOOSE_BLOCK_CARD", 
            playerId: "P3", 
            payload: { blockingCard: "Captain" } 
        };
        game.handleAction("room1", chooseBlockAction, state);

        // Verify both events were emitted
        expect(mockOnEvent).toHaveBeenCalledWith("room1", "coup:blockAction", {
            action: "STEAL",
            blockedBy: "P3",
            blockingCard: "Captain"
        });

        expect(mockOnEvent).toHaveBeenCalledWith("room1", "game:pendingAction", {
            type: "BLOCK_PENDING_CHALLENGE",
            action: "STEAL",
            blockedBy: "P3",
            blockingCard: "Captain",
            originalAction: expect.objectContaining({
                type: "STEAL",
                fromPlayerId: "P1",
                toPlayerId: "P2"
            })
        });

        // Verify the state was updated with block information
        expect(state.pendingAction?.blockedBy).toBe("P3");
        expect(state.pendingAction?.blockingCard).toBe("Captain");
    });
});

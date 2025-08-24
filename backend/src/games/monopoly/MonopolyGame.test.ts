// tests for Phase 1 Monopoly implementation
import { MonopolyGame, MonopolyGameState, BoardSpaceType } from './MonopolyGame';
import { Player } from '../../rooms';

describe('MonopolyGame Phase 1 Tests', () => {
    let game: MonopolyGame;
    let testPlayers: Player[];
    let gameState: MonopolyGameState;

    beforeEach(() => {
        game = new MonopolyGame();
        testPlayers = [
            { playerId: 'player1', name: 'Alice', isHost: false, lastSeen: Date.now() },
            { playerId: 'player2', name: 'Bob', isHost: false, lastSeen: Date.now() }
        ];
        gameState = game.initGame('test-room', testPlayers);
    });

    describe('CORE-001: Board Schema Definition', () => {
        test('should create board with 40 spaces', () => {
            expect(gameState.board).toHaveLength(40);
        });

        test('should have GO at position 0', () => {
            expect(gameState.board[0].name).toBe('GO');
            expect(gameState.board[0].type).toBe(BoardSpaceType.GO);
        });

        test('should have Jail at position 10', () => {
            expect(gameState.board[10].name).toBe('Jail');
            expect(gameState.board[10].type).toBe(BoardSpaceType.JAIL);
        });

        test('should have Go to Jail at position 30', () => {
            expect(gameState.board[30].name).toBe('Go to Jail');
            expect(gameState.board[30].type).toBe(BoardSpaceType.GO_TO_JAIL);
        });

        test('should have proper property data', () => {
            const mediterraneanAve = gameState.board[1];
            expect(mediterraneanAve.name).toBe('Mediterranean Avenue');
            expect(mediterraneanAve.type).toBe(BoardSpaceType.PROPERTY);
            expect(mediterraneanAve.price).toBe(60);
            expect(mediterraneanAve.rent).toEqual([2, 10, 30, 90, 160, 250]);
        });

        test('should have railroads at correct positions', () => {
            const railroads = [5, 15, 25, 35];
            railroads.forEach(pos => {
                expect(gameState.board[pos].type).toBe(BoardSpaceType.RAILROAD);
                expect(gameState.board[pos].price).toBe(200);
            });
        });
    });

    describe('CORE-002: Dice Engine with Doubles', () => {
        test('should allow dice roll action', () => {
            const action = { type: 'ROLL_DICE', playerId: 'player1' };
            expect(game.validateAction(action, gameState)).toBe(true);
        });

        test('should update dice state when rolling', () => {
            const action = { type: 'ROLL_DICE', playerId: 'player1' };
            const newState = game.handleAction('test-room', action, gameState);
            
            expect(newState.dice).toHaveLength(2);
            expect(newState.dice[0]).toBeGreaterThanOrEqual(1);
            expect(newState.dice[0]).toBeLessThanOrEqual(6);
            expect(newState.dice[1]).toBeGreaterThanOrEqual(1);
            expect(newState.dice[1]).toBeLessThanOrEqual(6);
        });

        test('should track doubles count', () => {
            expect(gameState.doublesCount).toBe(0);
        });
    });

    describe('CORE-003: Token Movement', () => {
        test('should start players at position 0', () => {
            gameState.players.forEach(player => {
                expect(player.position).toBe(0);
            });
        });

        test('should move player when rolling dice', () => {
            const originalPosition = gameState.players[0].position;
            const action = { type: 'ROLL_DICE', playerId: 'player1' };
            const newState = game.handleAction('test-room', action, gameState);
            
            const diceTotal = newState.dice[0] + newState.dice[1];
            expect(newState.players[0].position).toBe((originalPosition + diceTotal) % 40);
        });
    });

    describe('CORE-004: Turn Sequencing', () => {
        test('should start with first player', () => {
            expect(gameState.currentTurnPlayerId).toBe('player1');
        });

        test('should allow ending turn', () => {
            const action = { type: 'END_TURN', playerId: 'player1' };
            expect(game.validateAction(action, gameState)).toBe(true);
        });

        test('should advance to next player on end turn', () => {
            const action = { type: 'END_TURN', playerId: 'player1' };
            const newState = game.handleAction('test-room', action, gameState);
            
            expect(newState.currentTurnPlayerId).toBe('player2');
        });
    });

    describe('CORE-005: Go Salary Handling', () => {
        test('should start players with $1500', () => {
            gameState.players.forEach(player => {
                expect(player.money).toBe(1500);
            });
        });
    });

    describe('CORE-006: Property Purchase Flow', () => {
        test('should allow property purchase when on purchasable space', () => {
            // Move player to Mediterranean Avenue (position 1)
            gameState.players[0].position = 1;
            
            const action = { type: 'BUY_PROPERTY', playerId: 'player1' };
            expect(game.validateAction(action, gameState)).toBe(true);
        });

        test('should not allow property purchase when cannot afford', () => {
            gameState.players[0].position = 1;
            gameState.players[0].money = 50; // Less than Mediterranean Avenue price (60)
            
            const action = { type: 'BUY_PROPERTY', playerId: 'player1' };
            expect(game.validateAction(action, gameState)).toBe(false);
        });

        test('should transfer property ownership on purchase', () => {
            gameState.players[0].position = 1; // Mediterranean Avenue
            const originalMoney = gameState.players[0].money;
            
            const action = { type: 'BUY_PROPERTY', playerId: 'player1' };
            const newState = game.handleAction('test-room', action, gameState);
            
            expect(newState.players[0].properties).toContain(1);
            expect(newState.players[0].money).toBe(originalMoney - 60);
        });
    });

    describe('Game Initialization', () => {
        test('should initialize players correctly', () => {
            expect(gameState.players).toHaveLength(2);
            expect(gameState.players[0].playerId).toBe('player1');
            expect(gameState.players[0].name).toBe('Alice');
            expect(gameState.players[0].properties).toEqual([]);
            expect(gameState.players[0].houses).toEqual({});
            expect(gameState.players[0].hotels).toEqual([]);
            expect(gameState.players[0].jailTurns).toBe(0);
            expect(gameState.players[0].bankrupt).toBe(false);
        });

        test('should initialize bank correctly', () => {
            expect(gameState.bank.houses).toBe(32);
            expect(gameState.bank.hotels).toBe(12);
            expect(gameState.bank.money).toBe(15140);
        });

        test('should have game phase as PLAYING', () => {
            expect(gameState.gamePhase).toBe('PLAYING');
        });

        test('should create initial log entry', () => {
            expect(gameState.logs).toContain('Game started with 2 players');
        });
    });

    describe('Action Validation', () => {
        test('should reject actions from non-current player', () => {
            const action = { type: 'ROLL_DICE', playerId: 'player2' }; // player1 is current
            expect(game.validateAction(action, gameState)).toBe(false);
        });

        test('should reject actions from bankrupt player', () => {
            gameState.players[0].bankrupt = true;
            const action = { type: 'ROLL_DICE', playerId: 'player1' };
            expect(game.validateAction(action, gameState)).toBe(false);
        });

        test('should reject invalid action types', () => {
            const action = { type: 'INVALID_ACTION', playerId: 'player1' };
            expect(game.validateAction(action, gameState)).toBe(false);
        });
    });
});
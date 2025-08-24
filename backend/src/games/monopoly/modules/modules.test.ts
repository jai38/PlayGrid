// Tests for CORE-030 refactored modules
import { MovementModule } from './MovementModule';
import { PaymentModule } from './PaymentModule';
import { RulesModule } from './RulesModule';
import { MonopolyPlayer, BoardSpace, BoardSpaceType, PropertyColor } from '../MonopolyGame';

describe('CORE-030: Refactored Core Engine Modules', () => {
    let testPlayer: MonopolyPlayer;
    let testBoard: BoardSpace[];

    beforeEach(() => {
        testPlayer = {
            playerId: 'player1',
            name: 'Alice',
            isHost: false,
            lastSeen: Date.now(),
            position: 0,
            money: 1500,
            properties: [],
            houses: {},
            hotels: [],
            jailTurns: 0,
            getOutOfJailCards: 0,
            bankrupt: false,
            mortgagedProperties: []
        };

        testBoard = Array(40).fill(null).map((_, i) => ({
            id: i,
            name: `Space ${i}`,
            type: BoardSpaceType.PROPERTY
        }));
        
        // Override specific spaces for testing
        testBoard[0] = { id: 0, name: "GO", type: BoardSpaceType.GO };
        testBoard[1] = { id: 1, name: "Mediterranean Avenue", type: BoardSpaceType.PROPERTY, price: 60, rent: [2, 10, 30, 90, 160, 250], color: PropertyColor.BROWN, mortgage: 30, houseCost: 50 };
        testBoard[3] = { id: 3, name: "Baltic Avenue", type: BoardSpaceType.PROPERTY, price: 60, rent: [4, 20, 60, 180, 320, 450], color: PropertyColor.BROWN, mortgage: 30, houseCost: 50 };
        testBoard[5] = { id: 5, name: "Reading Railroad", type: BoardSpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgage: 100 };
        testBoard[12] = { id: 12, name: "Electric Company", type: BoardSpaceType.UTILITY, price: 150, mortgage: 75 };
    });

    describe('MovementModule', () => {
        test('should calculate new position correctly', () => {
            expect(MovementModule.calculateNewPosition(0, 7)).toBe(7);
            expect(MovementModule.calculateNewPosition(35, 8)).toBe(3); // Wrap around
        });

        test('should detect passing GO', () => {
            expect(MovementModule.hasPassedGO(35, 3)).toBe(true);
            expect(MovementModule.hasPassedGO(5, 10)).toBe(false);
            expect(MovementModule.hasPassedGO(0, 39)).toBe(false); // Going backwards shouldn't count
        });

        test('should apply GO salary correctly', () => {
            const updatedPlayer = MovementModule.applyGOSalary(testPlayer, 35, 3);
            expect(updatedPlayer.money).toBe(1700); // 1500 + 200
            
            const noSalaryPlayer = MovementModule.applyGOSalary(testPlayer, 5, 10);
            expect(noSalaryPlayer.money).toBe(1500); // No change
        });

        test('should handle card-based movement with GO salary', () => {
            const result = MovementModule.movePlayerToPosition(testPlayer, 3, "card");
            expect(result.player.position).toBe(3);
            expect(result.passedGO).toBe(false); // Started at 0, moved to 3
            expect(result.goSalary).toBe(0);
            
            // Test passing GO
            testPlayer.position = 35;
            const passGOResult = MovementModule.movePlayerToPosition(testPlayer, 3, "card");
            expect(passGOResult.passedGO).toBe(true);
            expect(passGOResult.goSalary).toBe(200);
        });
    });

    describe('PaymentModule', () => {
        test('should calculate rent for properties correctly', () => {
            const owner = { ...testPlayer, properties: [1], houses: { 1: 0 }, hotels: [] };
            const rent = PaymentModule.calculateRent(testBoard[1], owner, 7, testBoard);
            expect(rent).toBe(2); // Base rent for Mediterranean Avenue
        });

        test('should calculate rent with monopoly bonus', () => {
            const owner = { ...testPlayer, properties: [1, 3], houses: { 1: 0, 3: 0 }, hotels: [] };
            const rent = PaymentModule.calculateRent(testBoard[1], owner, 7, testBoard);
            expect(rent).toBe(4); // Double rent for monopoly (2 * 2)
        });

        test('should calculate utility rent correctly', () => {
            const owner = { ...testPlayer, properties: [12] };
            const rent = PaymentModule.calculateRent(testBoard[12], owner, 7, testBoard); // Electric Company
            expect(rent).toBe(28); // 7 * 4 (single utility)
        });

        test('should check if property is mortgaged', () => {
            testPlayer.mortgagedProperties = [1];
            expect(PaymentModule.isPropertyMortgaged(1, testPlayer)).toBe(true);
            expect(PaymentModule.isPropertyMortgaged(3, testPlayer)).toBe(false);
        });

        test('should create payment chain correctly', () => {
            const payments = [
                { amount: 100, description: "Rent", toPlayerId: "player2" },
                { amount: 50, description: "Tax", toBank: true }
            ];
            const chain = PaymentModule.createPaymentChain("player1", payments);
            
            expect(chain.playerId).toBe("player1");
            expect(chain.totalAmount).toBe(150);
            expect(chain.currentIndex).toBe(0);
            expect(chain.payments).toEqual(payments);
        });

        test('should calculate liquidation value', () => {
            testPlayer.properties = [1];
            testPlayer.houses = { 1: 2 };
            testPlayer.money = 500;
            
            const liquidValue = PaymentModule.calculateLiquidationValue(testPlayer, testBoard);
            // 500 (money) + 30 (mortgage value) + 50 (2 houses at half price)
            expect(liquidValue).toBe(580);
        });
    });

    describe('RulesModule', () => {
        test('should validate even building correctly', () => {
            testPlayer.properties = [1, 3]; // Brown monopoly
            testPlayer.houses = { 1: 1, 3: 1 }; // Even building
            
            const validResult = RulesModule.validateEvenBuilding(1, testPlayer, testBoard);
            expect(validResult.isValid).toBe(true);
            
            // Test uneven building
            testPlayer.houses = { 1: 2, 3: 1 }; // Uneven
            const invalidResult = RulesModule.validateEvenBuilding(1, testPlayer, testBoard);
            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.reason).toContain("uneven building");
        });

        test('should check player eligibility', () => {
            const eligibleResult = RulesModule.isPlayerEligible(testPlayer);
            expect(eligibleResult.isEligible).toBe(true);
            
            testPlayer.bankrupt = true;
            const ineligibleResult = RulesModule.isPlayerEligible(testPlayer);
            expect(ineligibleResult.isEligible).toBe(false);
            expect(ineligibleResult.reason).toBe("Player is bankrupt");
        });

        test('should detect turn timeout', () => {
            const recentTime = Date.now() - 30000; // 30 seconds ago
            const oldTime = Date.now() - 90000; // 90 seconds ago
            
            expect(RulesModule.isTurnExpired(recentTime, 60)).toBe(false);
            expect(RulesModule.isTurnExpired(oldTime, 60)).toBe(true);
        });

        test('should initialize jail state correctly', () => {
            const normalStart = RulesModule.initializeJailState(false);
            expect(normalStart.position).toBe(0);
            expect(normalStart.jailTurns).toBe(0);
            
            const jailStart = RulesModule.initializeJailState(true);
            expect(jailStart.position).toBe(10);
            expect(jailStart.jailTurns).toBe(1);
        });

        test('should validate property purchase', () => {
            const players = [testPlayer];
            const validResult = RulesModule.validatePropertyPurchase(testPlayer, testBoard[1], players);
            expect(validResult.isValid).toBe(true);
            
            // Test insufficient funds
            testPlayer.money = 50;
            const insufficientResult = RulesModule.validatePropertyPurchase(testPlayer, testBoard[1], players);
            expect(insufficientResult.isValid).toBe(false);
            expect(insufficientResult.reason).toBe("Insufficient funds");
        });

        test('should get next player correctly', () => {
            const players = [
                { ...testPlayer, playerId: 'p1', bankrupt: false },
                { ...testPlayer, playerId: 'p2', bankrupt: true },
                { ...testPlayer, playerId: 'p3', bankrupt: false }
            ];
            
            const nextId = RulesModule.getNextPlayer('p1', players);
            expect(nextId).toBe('p3'); // Should skip bankrupt p2
        });
    });
});
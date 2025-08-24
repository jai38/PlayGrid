// src/games/monopoly/MonopolyGame.ts
// Phase 1: Core Game Engine & Rules Implementation

import { IGame, GameAction, GameState } from "../IGame";
import { Player } from "../../rooms";

// CORE-001: Board Schema Definition
export enum BoardSpaceType {
    PROPERTY = "property",
    RAILROAD = "railroad", 
    UTILITY = "utility",
    CHANCE = "chance",
    COMMUNITY_CHEST = "community_chest",
    TAX = "tax",
    GO = "go",
    JAIL = "jail",
    FREE_PARKING = "free_parking",
    GO_TO_JAIL = "go_to_jail"
}

export enum PropertyColor {
    BROWN = "brown",
    LIGHT_BLUE = "light_blue", 
    PINK = "pink",
    ORANGE = "orange",
    RED = "red",
    YELLOW = "yellow",
    GREEN = "green",
    DARK_BLUE = "dark_blue"
}

export interface BoardSpace {
    id: number;
    name: string;
    type: BoardSpaceType;
    price?: number;
    rent?: number[];
    color?: PropertyColor;
    mortgage?: number;
    houseCost?: number;
    hotelCost?: number;
}

export interface MonopolyPlayer extends Player {
    position: number;
    money: number;
    properties: number[];
    houses: Record<number, number>; // propertyId -> house count
    hotels: number[];
    jailTurns: number;
    getOutOfJailCards: number;
    bankrupt: boolean;
    mortgagedProperties: number[]; // CORE-013/014: Track mortgaged properties
}

// CORE-019: Game Log Entry with timestamps and player refs
export interface GameLogEntry {
    timestamp: number;
    playerId?: string;
    playerName?: string;
    action: string;
    details?: any;
}

export interface MonopolyGameState extends GameState {
    players: MonopolyPlayer[];
    currentTurnPlayerId: string;
    board: BoardSpace[];
    dice: [number, number];
    doublesCount: number;
    gamePhase: "WAITING" | "PLAYING" | "GAME_OVER";
    bank: {
        houses: number;
        hotels: number;
        money: number;
    };
    logs: string[]; // Legacy simple logs for backward compatibility
    gameLog: GameLogEntry[]; // CORE-019: Enhanced structured game log
    freeParkingPot: number; // CORE-011: Free Parking money collection
    gameRules: {
        freeParkingCollectsWinnings: boolean; // CORE-011: House rule configuration
    };
}

export class MonopolyGame implements IGame {
    gameId = "monopoly";
    onEvent: ((roomId: string | string[], event: any, payload: any) => void) | undefined;

    // Game constants
    private static readonly STARTING_MONEY = 1500;
    private static readonly GO_SALARY = 200;
    private static readonly JAIL_POSITION = 10;
    private static readonly GO_TO_JAIL_POSITION = 30;
    private static readonly GO_POSITION = 0;
    private static readonly TOTAL_HOUSES = 32;
    private static readonly TOTAL_HOTELS = 12;

    // CORE-001: Board Schema Definition - Standard Monopoly board with 40 spaces
    private createBoard(): BoardSpace[] {
        return [
            // Row 1 (Bottom)
            { id: 0, name: "GO", type: BoardSpaceType.GO },
            { id: 1, name: "Mediterranean Avenue", type: BoardSpaceType.PROPERTY, price: 60, rent: [2, 10, 30, 90, 160, 250], color: PropertyColor.BROWN, mortgage: 30, houseCost: 50 },
            { id: 2, name: "Community Chest", type: BoardSpaceType.COMMUNITY_CHEST },
            { id: 3, name: "Baltic Avenue", type: BoardSpaceType.PROPERTY, price: 60, rent: [4, 20, 60, 180, 320, 450], color: PropertyColor.BROWN, mortgage: 30, houseCost: 50 },
            { id: 4, name: "Income Tax", type: BoardSpaceType.TAX },
            { id: 5, name: "Reading Railroad", type: BoardSpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
            { id: 6, name: "Oriental Avenue", type: BoardSpaceType.PROPERTY, price: 100, rent: [6, 30, 90, 270, 400, 550], color: PropertyColor.LIGHT_BLUE, mortgage: 50, houseCost: 50 },
            { id: 7, name: "Chance", type: BoardSpaceType.CHANCE },
            { id: 8, name: "Vermont Avenue", type: BoardSpaceType.PROPERTY, price: 100, rent: [6, 30, 90, 270, 400, 550], color: PropertyColor.LIGHT_BLUE, mortgage: 50, houseCost: 50 },
            { id: 9, name: "Connecticut Avenue", type: BoardSpaceType.PROPERTY, price: 120, rent: [8, 40, 100, 300, 450, 600], color: PropertyColor.LIGHT_BLUE, mortgage: 60, houseCost: 50 },
            
            // Row 2 (Left side)
            { id: 10, name: "Jail", type: BoardSpaceType.JAIL },
            { id: 11, name: "St. Charles Place", type: BoardSpaceType.PROPERTY, price: 140, rent: [10, 50, 150, 450, 625, 750], color: PropertyColor.PINK, mortgage: 70, houseCost: 100 },
            { id: 12, name: "Electric Company", type: BoardSpaceType.UTILITY, price: 150, mortgage: 75 },
            { id: 13, name: "States Avenue", type: BoardSpaceType.PROPERTY, price: 140, rent: [10, 50, 150, 450, 625, 750], color: PropertyColor.PINK, mortgage: 70, houseCost: 100 },
            { id: 14, name: "Virginia Avenue", type: BoardSpaceType.PROPERTY, price: 160, rent: [12, 60, 180, 500, 700, 900], color: PropertyColor.PINK, mortgage: 80, houseCost: 100 },
            { id: 15, name: "Pennsylvania Railroad", type: BoardSpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
            { id: 16, name: "St. James Place", type: BoardSpaceType.PROPERTY, price: 180, rent: [14, 70, 200, 550, 750, 950], color: PropertyColor.ORANGE, mortgage: 90, houseCost: 100 },
            { id: 17, name: "Community Chest", type: BoardSpaceType.COMMUNITY_CHEST },
            { id: 18, name: "Tennessee Avenue", type: BoardSpaceType.PROPERTY, price: 180, rent: [14, 70, 200, 550, 750, 950], color: PropertyColor.ORANGE, mortgage: 90, houseCost: 100 },
            { id: 19, name: "New York Avenue", type: BoardSpaceType.PROPERTY, price: 200, rent: [16, 80, 220, 600, 800, 1000], color: PropertyColor.ORANGE, mortgage: 100, houseCost: 100 },
            
            // Row 3 (Top)
            { id: 20, name: "Free Parking", type: BoardSpaceType.FREE_PARKING },
            { id: 21, name: "Kentucky Avenue", type: BoardSpaceType.PROPERTY, price: 220, rent: [18, 90, 250, 700, 875, 1050], color: PropertyColor.RED, mortgage: 110, houseCost: 150 },
            { id: 22, name: "Chance", type: BoardSpaceType.CHANCE },
            { id: 23, name: "Indiana Avenue", type: BoardSpaceType.PROPERTY, price: 220, rent: [18, 90, 250, 700, 875, 1050], color: PropertyColor.RED, mortgage: 110, houseCost: 150 },
            { id: 24, name: "Illinois Avenue", type: BoardSpaceType.PROPERTY, price: 240, rent: [20, 100, 300, 750, 925, 1100], color: PropertyColor.RED, mortgage: 120, houseCost: 150 },
            { id: 25, name: "B&O Railroad", type: BoardSpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
            { id: 26, name: "Atlantic Avenue", type: BoardSpaceType.PROPERTY, price: 260, rent: [22, 110, 330, 800, 975, 1150], color: PropertyColor.YELLOW, mortgage: 130, houseCost: 150 },
            { id: 27, name: "Ventnor Avenue", type: BoardSpaceType.PROPERTY, price: 260, rent: [22, 110, 330, 800, 975, 1150], color: PropertyColor.YELLOW, mortgage: 130, houseCost: 150 },
            { id: 28, name: "Water Works", type: BoardSpaceType.UTILITY, price: 150, mortgage: 75 },
            { id: 29, name: "Marvin Gardens", type: BoardSpaceType.PROPERTY, price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: PropertyColor.YELLOW, mortgage: 140, houseCost: 150 },
            
            // Row 4 (Right side)
            { id: 30, name: "Go to Jail", type: BoardSpaceType.GO_TO_JAIL },
            { id: 31, name: "Pacific Avenue", type: BoardSpaceType.PROPERTY, price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: PropertyColor.GREEN, mortgage: 150, houseCost: 200 },
            { id: 32, name: "North Carolina Avenue", type: BoardSpaceType.PROPERTY, price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: PropertyColor.GREEN, mortgage: 150, houseCost: 200 },
            { id: 33, name: "Community Chest", type: BoardSpaceType.COMMUNITY_CHEST },
            { id: 34, name: "Pennsylvania Avenue", type: BoardSpaceType.PROPERTY, price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: PropertyColor.GREEN, mortgage: 160, houseCost: 200 },
            { id: 35, name: "Short Line", type: BoardSpaceType.RAILROAD, price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
            { id: 36, name: "Chance", type: BoardSpaceType.CHANCE },
            { id: 37, name: "Park Place", type: BoardSpaceType.PROPERTY, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: PropertyColor.DARK_BLUE, mortgage: 175, houseCost: 200 },
            { id: 38, name: "Luxury Tax", type: BoardSpaceType.TAX },
            { id: 39, name: "Boardwalk", type: BoardSpaceType.PROPERTY, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: PropertyColor.DARK_BLUE, mortgage: 200, houseCost: 200 }
        ];
    }

    initGame(roomId: string, players: Player[]): MonopolyGameState {
        const monopolyPlayers: MonopolyPlayer[] = players.map(player => ({
            ...player,
            position: 0,
            money: MonopolyGame.STARTING_MONEY,
            properties: [],
            houses: {},
            hotels: [],
            jailTurns: 0,
            getOutOfJailCards: 0,
            bankrupt: false,
            mortgagedProperties: [] // CORE-013/014: Initialize mortgaged properties
        }));

        const initialState: MonopolyGameState = {
            players: monopolyPlayers,
            currentTurnPlayerId: players[0]?.playerId || "",
            board: this.createBoard(),
            dice: [1, 1],
            doublesCount: 0,
            gamePhase: "PLAYING",
            bank: {
                houses: MonopolyGame.TOTAL_HOUSES,
                hotels: MonopolyGame.TOTAL_HOTELS,
                money: 15140 // Starting bank money
            },
            logs: [`Game started with ${players.length} players`],
            gameLog: [], // CORE-019: Initialize structured game log
            freeParkingPot: 0, // CORE-011: Initialize Free Parking pot
            gameRules: {
                freeParkingCollectsWinnings: false // CORE-011: Default to standard rules
            }
        };

        // CORE-019: Add initial game log entry
        this.addGameLogEntry(initialState, `Game started with ${players.length} players`, undefined, {
            playerCount: players.length,
            playerNames: players.map(p => p.name)
        });

        return initialState;
    }

    // CORE-019: Game Log Helper Methods
    private addGameLogEntry(state: MonopolyGameState, action: string, playerId?: string, details?: any): void {
        const player = playerId ? state.players.find(p => p.playerId === playerId) : undefined;
        const logEntry: GameLogEntry = {
            timestamp: Date.now(),
            playerId,
            playerName: player?.name,
            action,
            details
        };
        state.gameLog.push(logEntry);
        
        // Also add to legacy logs for backward compatibility
        const logMessage = player ? `${player.name}: ${action}` : action;
        state.logs.push(logMessage);
    }

    // CORE-011: Free Parking Management
    private handleFreeParking(state: MonopolyGameState, player: MonopolyPlayer): void {
        if (player.position === 20) { // Free Parking position
            if (state.gameRules.freeParkingCollectsWinnings && state.freeParkingPot > 0) {
                player.money += state.freeParkingPot;
                this.addGameLogEntry(state, player.playerId, `collected $${state.freeParkingPot} from Free Parking`, {
                    amount: state.freeParkingPot
                });
                state.freeParkingPot = 0;
            } else {
                this.addGameLogEntry(state, player.playerId, "landed on Free Parking (no money collected)");
            }
        }
    }

    // CORE-011: Add money to Free Parking pot (for taxes, fines, etc.)
    private addToFreeParkingPot(state: MonopolyGameState, amount: number): void {
        if (state.gameRules.freeParkingCollectsWinnings) {
            state.freeParkingPot += amount;
        }
    }

    // CORE-017: Illegal Move Guardrails - Enhanced validation
    validateAction(action: GameAction, state: MonopolyGameState): boolean {
        const player = state.players.find(p => p.playerId === action.playerId);
        if (!player || player.bankrupt) {
            this.addGameLogEntry(state, `Illegal action attempted by ${player?.name || 'unknown'} - player bankrupt or not found`, action.playerId);
            return false;
        }
        
        // CORE-017: Must be current player's turn for most actions
        if (state.currentTurnPlayerId !== action.playerId && !['TRADE_OFFER', 'TRADE_ACCEPT', 'TRADE_DECLINE'].includes(action.type)) {
            this.addGameLogEntry(state, `Illegal action attempted by ${player.name} - not their turn`, action.playerId);
            return false;
        }

        switch (action.type) {
            case "ROLL_DICE":
                // Can only roll dice if not in jail or trying to get out
                return player.jailTurns === 0 || player.jailTurns > 0;
            case "PAY_JAIL_FINE": // CORE-012: Jail exit by paying fine
                if (player.jailTurns <= 0) {
                    this.addGameLogEntry(state, "Illegal action - not in jail", action.playerId);
                    return false;
                }
                if (player.money < 50) {
                    this.addGameLogEntry(state, "Illegal action - insufficient funds for jail fine", action.playerId);
                    return false;
                }
                return true;
            case "USE_JAIL_CARD": // CORE-012: Jail exit using Get Out of Jail Free card
                if (player.jailTurns <= 0) {
                    this.addGameLogEntry(state, "Illegal action - not in jail", action.playerId);
                    return false;
                }
                if (player.getOutOfJailCards <= 0) {
                    this.addGameLogEntry(state, "Illegal action - no Get Out of Jail Free cards", action.playerId);
                    return false;
                }
                return true;
            case "BUY_PROPERTY":
                return this.validatePropertyPurchase(state, player);
            case "DECLINE_PURCHASE": // CORE-015: Trigger auction
                return this.validatePropertyPurchase(state, player);
            case "AUCTION_BID": // CORE-015: Auction bidding
                return this.validateAuctionBid(action, state, player);
            case "END_TURN":
                return true; // Current player can always end turn
            case "BUILD_HOUSE":
            case "BUILD_HOTEL":
                return this.validateBuilding(action, state, player);
            case "MORTGAGE_PROPERTY":
            case "UNMORTGAGE_PROPERTY":
                return this.validateMortgage(action, state, player);
            case "TRADE_OFFER": // CORE-016: Trade system
            case "TRADE_ACCEPT":
            case "TRADE_DECLINE":
                return this.validateTrade(action, state, player);
            default:
                this.addGameLogEntry(state, `Illegal action attempted - unknown action type: ${action.type}`, action.playerId);
                return false;
        }
    }

    handleAction(roomId: string, action: GameAction, state: MonopolyGameState): MonopolyGameState {
        const newState = { ...state };
        
        switch (action.type) {
            case "ROLL_DICE":
                return this.handleRollDice(newState);
            case "PAY_JAIL_FINE": // CORE-012: Pay to get out of jail
                return this.handlePayJailFine(newState, action.playerId);
            case "USE_JAIL_CARD": // CORE-012: Use Get Out of Jail Free card
                return this.handleUseJailCard(newState, action.playerId);
            case "BUY_PROPERTY":
                return this.handleBuyProperty(newState, action.playerId);
            case "DECLINE_PURCHASE": // CORE-015: Start auction
                return this.handleDeclinePurchase(newState, action.playerId);
            case "AUCTION_BID": // CORE-015: Auction bidding
                return this.handleAuctionBid(newState, action);
            case "END_TURN":
                return this.handleEndTurn(newState);
            case "BUILD_HOUSE":
                return this.handleBuildHouse(newState, action);
            case "BUILD_HOTEL":
                return this.handleBuildHotel(newState, action);
            case "MORTGAGE_PROPERTY":
                return this.handleMortgageProperty(newState, action);
            case "UNMORTGAGE_PROPERTY":
                return this.handleUnmortgageProperty(newState, action);
            case "TRADE_OFFER": // CORE-016: Trade system
                return this.handleTradeOffer(newState, action);
            case "TRADE_ACCEPT":
                return this.handleTradeAccept(newState, action);
            case "TRADE_DECLINE":
                return this.handleTradeDecline(newState, action);
            default:
                return newState;
        }
    }

    // CORE-002: Dice Engine (2d6) with Doubles
    private rollDice(): [number, number] {
        return [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
    }

    private handleRollDice(state: MonopolyGameState): MonopolyGameState {
        const dice = this.rollDice();
        const player = state.players.find(p => p.playerId === state.currentTurnPlayerId)!;
        
        state.dice = dice;
        const isDoubles = dice[0] === dice[1];
        const total = dice[0] + dice[1];

        // CORE-012: Handle jail mechanics
        if (player.jailTurns > 0) {
            this.addGameLogEntry(state, `rolled in jail: ${dice[0]}, ${dice[1]}`, player.playerId, { dice, inJail: true });
            
            if (isDoubles) {
                // Doubles gets you out of jail
                player.jailTurns = 0;
                this.addGameLogEntry(state, "rolled doubles and gets out of jail!", player.playerId);
            } else {
                // Increment jail turns, check if forced to pay
                player.jailTurns++;
                if (player.jailTurns > 3) {
                    // Must pay fine after 3 turns
                    if (player.money >= 50) {
                        player.money -= 50;
                        state.bank.money += 50;
                        this.addToFreeParkingPot(state, 50);
                        player.jailTurns = 0;
                        this.addGameLogEntry(state, "forced to pay $50 after 3 turns in jail", player.playerId);
                    } else {
                        // Player is bankrupt - handle bankruptcy
                        this.addGameLogEntry(state, "cannot pay jail fine - bankruptcy!", player.playerId);
                        // TODO: Handle bankruptcy
                    }
                } else {
                    this.addGameLogEntry(state, `stays in jail (turn ${player.jailTurns}/3)`, player.playerId);
                    return state; // Don't move or continue turn
                }
            }
        }

        // Only proceed with movement if not stuck in jail
        if (player.jailTurns === 0) {
            if (isDoubles) {
                state.doublesCount++;
                this.addGameLogEntry(state, `rolled doubles: ${dice[0]}, ${dice[1]}`, player.playerId, { dice, isDoubles: true });
                
                // CORE-012: Three doubles rule - go to jail
                if (state.doublesCount >= 3) {
                    this.addGameLogEntry(state, "rolled three doubles and goes to jail!", player.playerId, { reason: "three_doubles" });
                    player.position = MonopolyGame.JAIL_POSITION;
                    player.jailTurns = 1;
                    state.doublesCount = 0;
                    return this.handleEndTurn(state);
                }
            } else {
                state.doublesCount = 0;
                this.addGameLogEntry(state, `rolled: ${dice[0]}, ${dice[1]} (total: ${total})`, player.playerId, { dice, total });
            }

            // CORE-003: Token Movement with GO detection
            const oldPosition = player.position;
            const newPosition = (oldPosition + total) % 40;
            player.position = newPosition;

            // CORE-005: Go Salary Handling - Check if passed GO
            if (oldPosition > newPosition || (oldPosition !== 0 && newPosition === 0)) {
                player.money += MonopolyGame.GO_SALARY;
                this.addGameLogEntry(state, `passed GO and collected $${MonopolyGame.GO_SALARY}`, player.playerId, {
                    salary: MonopolyGame.GO_SALARY,
                    newMoney: player.money
                });
            }

            // Handle landing on special spaces
            this.handleLandingOnSpace(state, player);
        }

        return state;
    }

    private handleLandingOnSpace(state: MonopolyGameState, player: MonopolyPlayer): void {
        const space = state.board[player.position];
        this.addGameLogEntry(state, `landed on ${space.name}`, player.playerId, { 
            spaceId: space.id, 
            spaceName: space.name, 
            spaceType: space.type 
        });

        switch (space.type) {
            case BoardSpaceType.GO_TO_JAIL:
                player.position = MonopolyGame.JAIL_POSITION;
                player.jailTurns = 1;
                this.addGameLogEntry(state, "goes to jail!", player.playerId, { reason: "go_to_jail_space" });
                break;
            case BoardSpaceType.TAX:
                this.handleTaxSpace(state, player, space);
                break;
            case BoardSpaceType.FREE_PARKING:
                this.handleFreeParking(state, player); // CORE-011: Free Parking handling
                break;
            case BoardSpaceType.PROPERTY:
            case BoardSpaceType.RAILROAD:
            case BoardSpaceType.UTILITY:
                this.handlePropertySpace(state, player, space);
                break;
        }
    }

    // CORE-010: Income Tax & Luxury Tax
    // CORE-011: Optional Free Parking pot collection
    private handleTaxSpace(state: MonopolyGameState, player: MonopolyPlayer, space: BoardSpace): void {
        let taxAmount = 0;
        if (space.id === 4) { // Income Tax
            taxAmount = 200; // Fixed amount for Income Tax
        } else if (space.id === 38) { // Luxury Tax
            taxAmount = 75; // Fixed amount for Luxury Tax
        }
        
        player.money -= taxAmount;
        state.bank.money += taxAmount;
        
        // CORE-011: Add to Free Parking pot if house rule is enabled
        this.addToFreeParkingPot(state, taxAmount);
        
        this.addGameLogEntry(state, `paid $${taxAmount} in ${space.name}`, player.playerId, {
            amount: taxAmount,
            taxType: space.name,
            newMoney: player.money,
            freeParkingPot: state.freeParkingPot
        });
    }

    // CORE-007: Rent Calculation
    // CORE-013/014: Enhanced with bankruptcy handling
    private handlePropertySpace(state: MonopolyGameState, player: MonopolyPlayer, space: BoardSpace): void {
        const owner = state.players.find(p => p.properties.includes(space.id));
        
        if (!owner || owner.playerId === player.playerId) {
            return; // No owner or player owns it
        }

        if (owner.jailTurns > 0) {
            return; // Owner is in jail, no rent
        }

        // Check if property is mortgaged
        if (owner.mortgagedProperties.includes(space.id)) {
            this.addGameLogEntry(state, `landed on mortgaged ${space.name} - no rent due`, player.playerId, {
                propertyName: space.name,
                ownerId: owner.playerId
            });
            return;
        }

        const rent = this.calculateRent(state, space, owner);
        
        // CORE-013/CORE-014: Check if player can afford rent
        if (player.money < rent) {
            this.addGameLogEntry(state, `owes $${rent} rent but only has $${player.money}`, player.playerId, {
                rentOwed: rent,
                moneyAvailable: player.money,
                creditor: owner.playerId
            });
            
            // Attempt bankruptcy handling
            const isBankrupt = this.handlePlayerBankruptcy(state, player, rent, owner);
            if (isBankrupt) {
                return; // Player is now bankrupt, no rent payment needed
            }
        }
        
        // Player can afford rent or has liquidated assets
        if (player.money >= rent) {
            player.money -= rent;
            owner.money += rent;
            
            this.addGameLogEntry(state, `paid $${rent} rent to ${owner.name} for ${space.name}`, player.playerId, {
                amount: rent,
                propertyName: space.name,
                ownerId: owner.playerId,
                ownerName: owner.name,
                newMoney: player.money
            });
        }
    }

    private calculateRent(state: MonopolyGameState, space: BoardSpace, owner: MonopolyPlayer): number {
        if (space.type === BoardSpaceType.UTILITY) {
            const utilitiesOwned = owner.properties.filter(propId => 
                state.board[propId].type === BoardSpaceType.UTILITY
            ).length;
            const multiplier = utilitiesOwned === 1 ? 4 : 10;
            return (state.dice[0] + state.dice[1]) * multiplier;
        }

        if (space.type === BoardSpaceType.RAILROAD) {
            const railroadsOwned = owner.properties.filter(propId =>
                state.board[propId].type === BoardSpaceType.RAILROAD
            ).length;
            return space.rent![railroadsOwned - 1];
        }

        if (space.type === BoardSpaceType.PROPERTY) {
            const houses = owner.houses[space.id] || 0;
            const hasHotel = owner.hotels.includes(space.id);
            
            if (hasHotel) {
                return space.rent![5]; // Hotel rent
            }
            
            if (houses > 0) {
                return space.rent![houses]; // House rent
            }

            // Check for color monopoly
            const colorProperties = state.board.filter(s => s.color === space.color);
            const ownedInColor = colorProperties.filter(s => owner.properties.includes(s.id));
            
            if (ownedInColor.length === colorProperties.length) {
                return space.rent![0] * 2; // Double rent for monopoly
            }
            
            return space.rent![0]; // Base rent
        }

        return 0;
    }

    // CORE-006: Property Purchase Flow
    private validatePropertyPurchase(state: MonopolyGameState, player: MonopolyPlayer): boolean {
        const space = state.board[player.position];
        
        if (!space.price) return false; // Not purchasable
        if (player.money < space.price) return false; // Can't afford
        
        // Check if already owned
        const isOwned = state.players.some(p => p.properties.includes(space.id));
        return !isOwned;
    }

    private handleBuyProperty(state: MonopolyGameState, playerId: string): MonopolyGameState {
        const player = state.players.find(p => p.playerId === playerId)!;
        const space = state.board[player.position];
        
        if (space.price && player.money >= space.price) {
            player.money -= space.price;
            player.properties.push(space.id);
            state.bank.money += space.price;
            
            this.addGameLogEntry(state, `bought ${space.name} for $${space.price}`, playerId, {
                propertyId: space.id,
                propertyName: space.name,
                price: space.price,
                newMoney: player.money
            });
        }
        
        return state;
    }

    // CORE-008: House & Hotel Purchase
    // CORE-020: Bank Cash & Inventory validation
    private validateBuilding(action: GameAction, state: MonopolyGameState, player: MonopolyPlayer): boolean {
        const propertyId = action.payload?.propertyId;
        if (!propertyId || !player.properties.includes(propertyId)) return false;
        
        const space = state.board[propertyId];
        if (space.type !== BoardSpaceType.PROPERTY) return false;
        
        // Must own all properties in color group
        const colorProperties = state.board.filter(s => s.color === space.color);
        const ownedInColor = colorProperties.filter(s => player.properties.includes(s.id));
        if (ownedInColor.length !== colorProperties.length) return false;
        
        if (action.type === "BUILD_HOUSE") {
            // CORE-020: Check bank has houses and player has money
            return state.bank.houses > 0 && player.money >= (space.houseCost || 0);
        } else {
            const houses = player.houses[propertyId] || 0;
            // CORE-020: Check bank has hotels and player has money
            return houses === 4 && state.bank.hotels > 0 && player.money >= (space.hotelCost || space.houseCost || 0);
        }
    }

    private handleBuildHouse(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        const player = state.players.find(p => p.playerId === action.playerId)!;
        const propertyId = action.payload.propertyId;
        const space = state.board[propertyId];
        
        const cost = space.houseCost || 0;
        
        // CORE-020: Check bank inventory
        if (state.bank.houses <= 0) {
            this.addGameLogEntry(state, "cannot build house - bank has no houses available", action.playerId, {
                propertyId,
                propertyName: space.name
            });
            return state;
        }
        
        player.money -= cost;
        state.bank.money += cost;
        state.bank.houses--;
        
        player.houses[propertyId] = (player.houses[propertyId] || 0) + 1;
        
        this.addGameLogEntry(state, `built a house on ${space.name} for $${cost}`, action.playerId, {
            propertyId,
            propertyName: space.name,
            cost,
            housesOnProperty: player.houses[propertyId],
            bankHousesRemaining: state.bank.houses
        });
        
        return state;
    }

    private handleBuildHotel(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        const player = state.players.find(p => p.playerId === action.playerId)!;
        const propertyId = action.payload.propertyId;
        const space = state.board[propertyId];
        
        const cost = space.hotelCost || space.houseCost || 0;
        
        // CORE-020: Check bank inventory
        if (state.bank.hotels <= 0) {
            this.addGameLogEntry(state, "cannot build hotel - bank has no hotels available", action.playerId, {
                propertyId,
                propertyName: space.name
            });
            return state;
        }
        
        player.money -= cost;
        state.bank.money += cost;
        state.bank.hotels--;
        state.bank.houses += 4; // Return 4 houses to bank
        
        delete player.houses[propertyId];
        player.hotels.push(propertyId);
        
        this.addGameLogEntry(state, `built a hotel on ${space.name} for $${cost}`, action.playerId, {
            propertyId,
            propertyName: space.name,
            cost,
            bankHotelsRemaining: state.bank.hotels,
            bankHousesReturned: 4
        });
        
        return state;
    }

    // CORE-009: Mortgage/Unmortgage Rules
    private validateMortgage(action: GameAction, state: MonopolyGameState, player: MonopolyPlayer): boolean {
        const propertyId = action.payload?.propertyId;
        if (!propertyId) return false;
        
        if (action.type === "MORTGAGE_PROPERTY") {
            // Must own the property (not mortgaged)
            if (!player.properties.includes(propertyId)) return false;
            
            // Can't mortgage if has houses/hotels
            const houses = player.houses[propertyId] || 0;
            const hasHotel = player.hotels.includes(propertyId);
            return houses === 0 && !hasHotel;
        } else {
            // Must have the property mortgaged
            if (!player.mortgagedProperties.includes(propertyId)) return false;
            
            // Can unmortgage if have money
            const space = state.board[propertyId];
            const unmortgageCost = Math.floor((space.mortgage || 0) * 1.1);
            return player.money >= unmortgageCost;
        }
    }

    private handleMortgageProperty(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        const player = state.players.find(p => p.playerId === action.playerId)!;
        const propertyId = action.payload.propertyId;
        const space = state.board[propertyId];
        
        const mortgageValue = space.mortgage || 0;
        player.money += mortgageValue;
        state.bank.money -= mortgageValue;
        
        // Move property from owned to mortgaged
        player.properties = player.properties.filter(id => id !== propertyId);
        player.mortgagedProperties.push(propertyId);
        
        this.addGameLogEntry(state, `mortgaged ${space.name} for $${mortgageValue}`, action.playerId, {
            propertyId,
            propertyName: space.name,
            mortgageValue,
            newMoney: player.money
        });
        
        return state;
    }

    private handleUnmortgageProperty(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        const player = state.players.find(p => p.playerId === action.playerId)!;
        const propertyId = action.payload.propertyId;
        const space = state.board[propertyId];
        
        const unmortgageCost = Math.floor((space.mortgage || 0) * 1.1);
        player.money -= unmortgageCost;
        state.bank.money += unmortgageCost;
        
        // Move property from mortgaged to owned
        player.mortgagedProperties = player.mortgagedProperties.filter(id => id !== propertyId);
        player.properties.push(propertyId);
        
        this.addGameLogEntry(state, `unmortgaged ${space.name} for $${unmortgageCost}`, action.playerId, {
            propertyId,
            propertyName: space.name,
            unmortgageCost,
            newMoney: player.money
        });
        
        return state;
    }

    // CORE-004: Turn Sequencing
    private handleEndTurn(state: MonopolyGameState): MonopolyGameState {
        // If rolled doubles and not in jail, don't end turn
        if (state.doublesCount > 0 && state.dice[0] === state.dice[1]) {
            const currentPlayer = state.players.find(p => p.playerId === state.currentTurnPlayerId)!;
            if (currentPlayer.jailTurns === 0) {
                this.addGameLogEntry(state, "gets another turn for rolling doubles", currentPlayer.playerId);
                return state;
            }
        }

        // Reset doubles count
        state.doublesCount = 0;

        // Find next non-bankrupt player
        const currentIndex = state.players.findIndex(p => p.playerId === state.currentTurnPlayerId);
        let nextIndex = (currentIndex + 1) % state.players.length;
        
        // Skip bankrupt players
        while (state.players[nextIndex].bankrupt && nextIndex !== currentIndex) {
            nextIndex = (nextIndex + 1) % state.players.length;
        }
        
        state.currentTurnPlayerId = state.players[nextIndex].playerId;
        this.addGameLogEntry(state, `It's now ${state.players[nextIndex].name}'s turn`, undefined, {
            currentPlayerId: state.currentTurnPlayerId,
            currentPlayerName: state.players[nextIndex].name
        });
        
        return state;
    }

    // CORE-012: Jail Entry & Exit Rules
    private handlePayJailFine(state: MonopolyGameState, playerId: string): MonopolyGameState {
        const player = state.players.find(p => p.playerId === playerId)!;
        
        if (player.jailTurns > 0 && player.money >= 50) {
            player.money -= 50;
            player.jailTurns = 0;
            state.bank.money += 50;
            
            // CORE-011: Add fine to Free Parking pot if enabled
            this.addToFreeParkingPot(state, 50);
            
            this.addGameLogEntry(state, "paid $50 to get out of jail", playerId, {
                amount: 50,
                newMoney: player.money
            });
        }
        
        return state;
    }

    private handleUseJailCard(state: MonopolyGameState, playerId: string): MonopolyGameState {
        const player = state.players.find(p => p.playerId === playerId)!;
        
        if (player.jailTurns > 0 && player.getOutOfJailCards > 0) {
            player.jailTurns = 0;
            player.getOutOfJailCards--;
            
            this.addGameLogEntry(state, "used Get Out of Jail Free card", playerId, {
                cardsRemaining: player.getOutOfJailCards
            });
        }
        
        return state;
    }

    // CORE-015: Auction Mechanic (stub implementations for now)
    private validateAuctionBid(action: GameAction, state: MonopolyGameState, player: MonopolyPlayer): boolean {
        // TODO: Implement auction validation
        return true;
    }

    private handleDeclinePurchase(state: MonopolyGameState, playerId: string): MonopolyGameState {
        const player = state.players.find(p => p.playerId === playerId)!;
        const space = state.board[player.position];
        
        this.addGameLogEntry(state, `declined to purchase ${space.name}`, playerId, {
            propertyId: space.id,
            propertyName: space.name,
            price: space.price
        });
        
        // TODO: Start auction process
        return state;
    }

    private handleAuctionBid(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        // TODO: Implement auction bidding
        return state;
    }

    // CORE-016: Trade System (stub implementations for now)
    private validateTrade(action: GameAction, state: MonopolyGameState, player: MonopolyPlayer): boolean {
        // TODO: Implement trade validation
        return true;
    }

    private handleTradeOffer(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        // TODO: Implement trade offer
        return state;
    }

    private handleTradeAccept(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        // TODO: Implement trade acceptance
        return state;
    }

    private handleTradeDecline(state: MonopolyGameState, action: GameAction): MonopolyGameState {
        // TODO: Implement trade decline
        return state;
    }

    // CORE-013: Bankruptcy to Player - Transfer assets to creditor when rent/fees owed to player
    private handleBankruptcyToPlayer(state: MonopolyGameState, bankruptPlayer: MonopolyPlayer, creditorPlayer: MonopolyPlayer): void {
        this.addGameLogEntry(state, `declares bankruptcy to ${creditorPlayer.name}`, bankruptPlayer.playerId, {
            creditorId: creditorPlayer.playerId,
            creditorName: creditorPlayer.name,
            assetsTransferred: bankruptPlayer.properties.length
        });

        // Transfer all properties to creditor
        creditorPlayer.properties.push(...bankruptPlayer.properties);
        
        // Transfer houses and hotels
        for (const [propertyIdStr, houseCount] of Object.entries(bankruptPlayer.houses)) {
            const propertyId = parseInt(propertyIdStr);
            creditorPlayer.houses[propertyId] = (creditorPlayer.houses[propertyId] || 0) + houseCount;
        }
        creditorPlayer.hotels.push(...bankruptPlayer.hotels);
        
        // Transfer Get Out of Jail Free cards
        creditorPlayer.getOutOfJailCards += bankruptPlayer.getOutOfJailCards;
        
        // Transfer remaining money (if any)
        creditorPlayer.money += Math.max(0, bankruptPlayer.money);
        
        // Transfer mortgaged properties (remain mortgaged)
        creditorPlayer.mortgagedProperties.push(...bankruptPlayer.mortgagedProperties);
        
        // Clear bankrupt player's assets
        bankruptPlayer.properties = [];
        bankruptPlayer.houses = {};
        bankruptPlayer.hotels = [];
        bankruptPlayer.getOutOfJailCards = 0;
        bankruptPlayer.money = 0;
        bankruptPlayer.mortgagedProperties = [];
        bankruptPlayer.bankrupt = true;
        
        this.addGameLogEntry(state, `received all assets from bankrupt ${bankruptPlayer.name}`, creditorPlayer.playerId, {
            bankruptPlayerId: bankruptPlayer.playerId,
            bankruptPlayerName: bankruptPlayer.name
        });
    }

    // CORE-014: Bankruptcy to Bank - Assets return to bank, properties become unowned/mortgaged
    private handleBankruptcyToBank(state: MonopolyGameState, bankruptPlayer: MonopolyPlayer): void {
        this.addGameLogEntry(state, `declares bankruptcy to the bank`, bankruptPlayer.playerId, {
            propertiesReturned: bankruptPlayer.properties.length
        });

        // Return houses and hotels to bank
        for (const [propertyIdStr, houseCount] of Object.entries(bankruptPlayer.houses)) {
            state.bank.houses += houseCount;
        }
        state.bank.hotels += bankruptPlayer.hotels.length;
        
        // Properties become unowned (remove from all player property lists)
        const allProperties = [...bankruptPlayer.properties, ...bankruptPlayer.mortgagedProperties];
        for (const playerId of state.players) {
            playerId.properties = playerId.properties.filter(propId => !allProperties.includes(propId));
            playerId.mortgagedProperties = playerId.mortgagedProperties.filter(propId => !allProperties.includes(propId));
        }
        
        // Clear bankrupt player's assets
        bankruptPlayer.properties = [];
        bankruptPlayer.houses = {};
        bankruptPlayer.hotels = [];
        bankruptPlayer.getOutOfJailCards = 0;
        bankruptPlayer.money = 0;
        bankruptPlayer.mortgagedProperties = [];
        bankruptPlayer.bankrupt = true;
        
        this.addGameLogEntry(state, `Bank reclaimed properties from bankrupt ${bankruptPlayer.name}`, undefined, {
            bankruptPlayerId: bankruptPlayer.playerId,
            bankruptPlayerName: bankruptPlayer.name,
            propertiesReclaimed: allProperties.length
        });
    }

    // CORE-013/014: Determine bankruptcy and handle appropriately
    private handlePlayerBankruptcy(state: MonopolyGameState, bankruptPlayer: MonopolyPlayer, debtAmount: number, creditorPlayer?: MonopolyPlayer): boolean {
        // Calculate total assets that can be liquidated
        let liquidValue = bankruptPlayer.money;
        
        // Add mortgage value of unmortgaged properties
        for (const propertyId of bankruptPlayer.properties) {
            if (!bankruptPlayer.mortgagedProperties.includes(propertyId)) {
                const space = state.board[propertyId];
                liquidValue += space.mortgage || 0;
            }
        }
        
        // Add house/hotel values (sell back to bank at half price)
        for (const [propertyIdStr, houseCount] of Object.entries(bankruptPlayer.houses)) {
            const propertyId = parseInt(propertyIdStr);
            const space = state.board[propertyId];
            liquidValue += Math.floor((space.houseCost || 0) * houseCount / 2);
        }
        
        for (const propertyId of bankruptPlayer.hotels) {
            const space = state.board[propertyId];
            liquidValue += Math.floor((space.hotelCost || space.houseCost || 0) / 2);
        }
        
        if (liquidValue < debtAmount) {
            // Player cannot pay debt - bankruptcy
            if (creditorPlayer) {
                this.handleBankruptcyToPlayer(state, bankruptPlayer, creditorPlayer);
            } else {
                this.handleBankruptcyToBank(state, bankruptPlayer);
            }
            return true; // Player is now bankrupt
        }
        
        return false; // Player can potentially pay (though may need to liquidate assets)
    }
}
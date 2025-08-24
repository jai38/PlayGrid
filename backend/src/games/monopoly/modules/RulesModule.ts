// CORE-030: Rules Module - Pure functions for game rule validation and enforcement
import { MonopolyGameState, MonopolyPlayer, BoardSpace, BoardSpaceType } from '../MonopolyGame';

export class RulesModule {
    // CORE-026: Pure function for even building validation
    static validateEvenBuilding(
        propertyId: number, 
        player: MonopolyPlayer, 
        board: BoardSpace[]
    ): { isValid: boolean; reason?: string } {
        const space = board[propertyId];
        
        if (!space || space.type !== BoardSpaceType.PROPERTY) {
            return { isValid: false, reason: "Not a buildable property" };
        }

        // Must own all properties in color group
        const colorProperties = board.filter(s => s.color === space.color);
        const ownedInColor = colorProperties.filter(s => player.properties.includes(s.id));
        
        if (ownedInColor.length !== colorProperties.length) {
            return { isValid: false, reason: "Must own complete color group" };
        }

        // Check even building rule
        const currentHouses = player.houses[propertyId] || 0;
        const minHousesInColorSet = Math.min(...ownedInColor.map(prop => player.houses[prop.id] || 0));
        
        if (currentHouses > minHousesInColorSet) {
            return { isValid: false, reason: "Would create uneven building within color set" };
        }

        return { isValid: true };
    }

    // CORE-023: Pure function to check if player is eligible for actions
    static isPlayerEligible(player: MonopolyPlayer): { isEligible: boolean; reason?: string } {
        if (player.bankrupt) {
            return { isEligible: false, reason: "Player is bankrupt" };
        }
        return { isEligible: true };
    }

    // CORE-022: Pure function to check turn timeout
    static isTurnExpired(turnStartTime: number, timeoutSeconds: number): boolean {
        const timeElapsed = (Date.now() - turnStartTime) / 1000;
        return timeElapsed > timeoutSeconds;
    }

    // CORE-029: Pure function to initialize jail state
    static initializeJailState(startInJail: boolean): { position: number; jailTurns: number } {
        return {
            position: startInJail ? 10 : 0, // Jail is position 10
            jailTurns: startInJail ? 1 : 0
        };
    }

    // Pure function to validate property purchase
    static validatePropertyPurchase(
        player: MonopolyPlayer, 
        space: BoardSpace, 
        players: MonopolyPlayer[]
    ): { isValid: boolean; reason?: string } {
        if (!space.price) {
            return { isValid: false, reason: "Property is not purchasable" };
        }
        
        if (player.money < space.price) {
            return { isValid: false, reason: "Insufficient funds" };
        }
        
        // Check if already owned
        const isOwned = players.some(p => p.properties.includes(space.id));
        if (isOwned) {
            return { isValid: false, reason: "Property is already owned" };
        }

        return { isValid: true };
    }

    // Pure function to validate building construction
    static validateBuilding(
        propertyId: number,
        buildingType: 'house' | 'hotel',
        player: MonopolyPlayer,
        board: BoardSpace[],
        bankHouses: number,
        bankHotels: number
    ): { isValid: boolean; reason?: string } {
        if (!player.properties.includes(propertyId)) {
            return { isValid: false, reason: "Player does not own this property" };
        }

        const space = board[propertyId];
        if (space.type !== BoardSpaceType.PROPERTY) {
            return { isValid: false, reason: "Cannot build on this space type" };
        }

        // Check even building
        const evenBuildingResult = this.validateEvenBuilding(propertyId, player, board);
        if (!evenBuildingResult.isValid) {
            return evenBuildingResult;
        }

        if (buildingType === 'house') {
            if (bankHouses <= 0) {
                return { isValid: false, reason: "Bank has no houses available" };
            }
            
            if (player.money < (space.houseCost || 0)) {
                return { isValid: false, reason: "Insufficient funds for house" };
            }
        } else {
            const houses = player.houses[propertyId] || 0;
            if (houses !== 4) {
                return { isValid: false, reason: "Must have 4 houses before building hotel" };
            }
            
            if (bankHotels <= 0) {
                return { isValid: false, reason: "Bank has no hotels available" };
            }
            
            if (player.money < (space.hotelCost || space.houseCost || 0)) {
                return { isValid: false, reason: "Insufficient funds for hotel" };
            }
        }

        return { isValid: true };
    }

    // Pure function to calculate next player turn
    static getNextPlayer(currentPlayerId: string, players: MonopolyPlayer[]): string {
        const currentIndex = players.findIndex(p => p.playerId === currentPlayerId);
        let nextIndex = (currentIndex + 1) % players.length;
        
        // Skip bankrupt players
        let attempts = 0;
        while (players[nextIndex].bankrupt && attempts < players.length) {
            nextIndex = (nextIndex + 1) % players.length;
            attempts++;
        }
        
        return players[nextIndex].playerId;
    }
}
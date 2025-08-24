// CORE-030: Payment Module - Pure functions for payment processing and rent calculation
import { MonopolyGameState, MonopolyPlayer, BoardSpace, BoardSpaceType } from '../MonopolyGame';

export class PaymentModule {
    // CORE-007: Pure function for rent calculation
    static calculateRent(space: BoardSpace, owner: MonopolyPlayer, diceTotal: number, board: BoardSpace[]): number {
        if (space.type === BoardSpaceType.UTILITY) {
            const utilitiesOwned = owner.properties.filter(propId => 
                board[propId].type === BoardSpaceType.UTILITY
            ).length;
            const multiplier = utilitiesOwned === 1 ? 4 : 10;
            return diceTotal * multiplier;
        }

        if (space.type === BoardSpaceType.RAILROAD) {
            const railroadsOwned = owner.properties.filter(propId =>
                board[propId].type === BoardSpaceType.RAILROAD
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
            const colorProperties = board.filter(s => s.color === space.color);
            const ownedInColor = colorProperties.filter(s => owner.properties.includes(s.id));
            
            if (ownedInColor.length === colorProperties.length) {
                return space.rent![0] * 2; // Double rent for monopoly
            }
            
            return space.rent![0]; // Base rent
        }

        return 0;
    }

    // CORE-025: Pure function to check if property is mortgaged
    static isPropertyMortgaged(propertyId: number, owner: MonopolyPlayer): boolean {
        return owner.mortgagedProperties.includes(propertyId);
    }

    // CORE-021: Pure function to create payment chain
    static createPaymentChain(
        playerId: string, 
        payments: Array<{ amount: number; description: string; toPlayerId?: string; toBank?: boolean }>
    ) {
        return {
            playerId,
            payments,
            currentIndex: 0,
            totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
        };
    }

    // CORE-027: Pure function to calculate liquidation value
    static calculateLiquidationValue(player: MonopolyPlayer, board: BoardSpace[]): number {
        let liquidValue = player.money;
        
        // Add mortgage value of unmortgaged properties
        for (const propertyId of player.properties) {
            if (!player.mortgagedProperties.includes(propertyId)) {
                const space = board[propertyId];
                liquidValue += space.mortgage || 0;
            }
        }
        
        // Add house/hotel values (sell back to bank at half price)
        for (const [propertyIdStr, houseCount] of Object.entries(player.houses)) {
            const propertyId = parseInt(propertyIdStr);
            const space = board[propertyId];
            liquidValue += Math.floor((space.houseCost || 0) * houseCount / 2);
        }
        
        for (const propertyId of player.hotels) {
            const space = board[propertyId];
            liquidValue += Math.floor((space.hotelCost || space.houseCost || 0) / 2);
        }
        
        return liquidValue;
    }

    // Pure function to determine property owner
    static findPropertyOwner(propertyId: number, players: MonopolyPlayer[]): MonopolyPlayer | undefined {
        return players.find(p => p.properties.includes(propertyId) || p.mortgagedProperties.includes(propertyId));
    }

    // Pure function to check if player can afford amount
    static canAfford(player: MonopolyPlayer, amount: number): boolean {
        return player.money >= amount;
    }
}
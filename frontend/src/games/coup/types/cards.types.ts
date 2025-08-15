// src/games/coup/types/cards.types.ts

export enum InfluenceType {
    DUKE = 'DUKE',
    ASSASSIN = 'ASSASSIN',
    CAPTAIN = 'CAPTAIN',
    CONTESSA = 'CONTESSA',
    AMBASSADOR = 'AMBASSADOR'
}

export interface InfluenceCard {
    id: string;
    type: InfluenceType;
    isRevealed: boolean;
    isLost: boolean;
}

export interface CoupPlayerExtended {
    playerId: string;
    name: string;
    coins: number;
    isAlive: boolean;
    influences: InfluenceCard[];
    socketId?: string;
    position?: number; // Position around the table (0-based)
}

// Card colors and symbols for each influence
export const INFLUENCE_CONFIG = {
    [InfluenceType.DUKE]: {
        color: '#7c3aed',
        secondaryColor: '#5b21b6',
        symbol: '♔',
        name: 'Duke',
        power: 'Tax (Take 3 coins)',
        blocks: 'Foreign Aid'
    },
    [InfluenceType.ASSASSIN]: {
        color: '#dc2626',
        secondaryColor: '#991b1b',
        symbol: '⚔',
        name: 'Assassin',
        power: 'Assassinate (Pay 3 to eliminate)',
        blocks: 'None'
    },
    [InfluenceType.CAPTAIN]: {
        color: '#0ea5e9',
        secondaryColor: '#0284c7',
        symbol: '⚓',
        name: 'Captain',
        power: 'Steal (Take 2 from player)',
        blocks: 'Steal'
    },
    [InfluenceType.CONTESSA]: {
        color: '#dc2626',
        secondaryColor: '#991b1b',
        symbol: '♕',
        name: 'Contessa',
        power: 'None',
        blocks: 'Assassination'
    },
    [InfluenceType.AMBASSADOR]: {
        color: '#059669',
        secondaryColor: '#047857',
        symbol: '◊',
        name: 'Ambassador',
        power: 'Exchange (Swap with deck)',
        blocks: 'Steal'
    }
};
import { monopolyBoard, Tile } from "./board";

export interface Player {
    id: string; // unique player ID
    name: string;
    position: number; // 0 to 39
    money: number;
    properties: number[]; // tile IDs owned
    jailTurns: number; // how many turns in jail, 0 if not jailed
    getOutOfJailCards: number;
    bankrupt: boolean;
}

export type GamePhase = "waiting" | "rolling" | "buying" | "trading" | "ended";

export interface MonopolyGameState {
    players: Player[];
    board: Tile[];
    currentPlayerIndex: number; // index in players array
    dice: [number, number] | null;
    diceTotal?: number; // total of the last rolled dice
    houses: Record<number, number>; // tileId -> house count (0 to 4), hotel = 5
    phase: GamePhase;
    logs: string[]; // game event log
}

export function createInitialState(playerNames: string[]): MonopolyGameState {
    const players: Player[] = playerNames.map((name, idx) => ({
        id: `p${idx + 1}`,
        name,
        position: 0,
        money: 1500,
        properties: [],
        jailTurns: 0,
        getOutOfJailCards: 0,
        bankrupt: false,
    }));

    return {
        players,
        board: monopolyBoard,
        currentPlayerIndex: 0,
        dice: null,
        houses: {},
        phase: "waiting",
        logs: ["Game started."],
    };
}

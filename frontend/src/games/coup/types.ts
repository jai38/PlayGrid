
// export interface InfluenceCard {
//     name: string;
//     revealed?: boolean;
// }

export interface CoupPlayer {
    playerId: string;
    name: string;
    coins: number;
    isAlive: boolean;
    // optional shapes that server might send:
    influence?: string[]; // server may provide this
    revealedCards?: string[]; // server may provide this
    // client-friendly optional field:
    cardsRemaining?: number;
    socketId?: string;
}

export interface CoupGameState {
    players: CoupPlayer[];
    currentTurnPlayerId: string;
    // server may name fields slightly differently; we handle them gracefully
    pendingAction?: {
        type: string;
        // possible actor field names (we'll read any)
        actorId?: string;
        playerId?: string;
        fromPlayerId?: string;
        // possible target field names
        targetId?: string;
        toPlayerId?: string;
        // blocking/challenge meta
        blockedBy?: string;
        challengedBy?: string;
    };
    winner?: string;
}

export interface ActionPayload {
    targetId?: string;
    role?: string;
}
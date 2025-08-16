// src/games/coup/CoupGame.ts
import { IGame, GameAction, GameState } from "../IGame";
import { Player } from "../../rooms";

// Characters in Coup
export type CoupCard = "Duke" | "Assassin" | "Captain" | "Ambassador" | "Contessa";

// Player-specific state
interface CoupPlayer extends Player {
    coins: number;
    influence: CoupCard[];      // hidden cards
    revealedCards: CoupCard[];  // revealed/lost cards
    isAlive: boolean;
}

// Coup-specific game state
export interface CoupGameState extends GameState {
    players: CoupPlayer[];
    deck: CoupCard[];
    currentTurnPlayerId: string;
    pendingAction?: {
        type: string;
        fromPlayerId: string;
        toPlayerId?: string;
        blockedBy?: string;
    };
    winnerId?: string;
}

export class CoupGame implements IGame {
    gameId = "coup";

    // Create full deck (3 of each card)
    private createDeck(): CoupCard[] {
        const cards: CoupCard[] = [];
        const cardTypes: CoupCard[] = ["Duke", "Assassin", "Captain", "Ambassador", "Contessa"];
        for (const type of cardTypes) {
            for (let i = 0; i < 3; i++) {
                cards.push(type);
            }
        }
        return this.shuffle(cards);
    }

    private shuffle<T>(array: T[]): T[] {
        return [...array].sort(() => Math.random() - 0.5);
    }

    initGame(roomId: string, players: Player[]): CoupGameState {
        let deck = this.createDeck();
        const coupPlayers: CoupPlayer[] = players.map((p) => {
            const influence = [deck.pop()!, deck.pop()!]; // deal 2 cards
            return {
                ...p,
                coins: 2,
                influence,
                revealedCards: [],
                isAlive: true,
            };
        });

        return {
            players: coupPlayers,
            deck,
            currentTurnPlayerId: coupPlayers[0].playerId, // first player
        };
    }
    validateAction(action: GameAction, state: CoupGameState): boolean {
        const player = state.players.find(p => p.playerId === action.playerId);
        if (!player || !player.isAlive) return false;

        // If a challenge/block is pending, only those related actions are allowed
        if (state.pendingAction && !["BLOCK", "CHALLENGE", "RESOLVE_ACTION"].includes(action.type)) {
            return false;
        }

        // Must coup if 10+ coins
        if (player.coins >= 10 && action.type !== "COUP") {
            return false;
        }

        switch (action.type) {
            case "INCOME":
            case "TAX":
            case "FOREIGN_AID":
            case "EXCHANGE":
                return true;

            case "COUP":
                return player.coins >= 7 && this.isValidTarget(action.payload?.targetId, state, player.playerId);

            case "ASSASSINATE":
                return player.coins >= 3 && this.isValidTarget(action.payload?.targetId, state, player.playerId);

            case "STEAL":
                return this.isValidTarget(action.payload?.targetId, state, player.playerId);

            case "BLOCK":
            case "CHALLENGE":
            case "RESOLVE_ACTION":
                return true;

            default:
                return false;
        }
    }

    private isValidTarget(targetId: string, state: CoupGameState, selfId: string): boolean {
        const target = state.players.find(p => p.playerId === targetId);
        return !!target && target.isAlive && target.playerId !== selfId;
    }


    handleAction(roomId: string, action: GameAction, state: CoupGameState): CoupGameState {
        const player = state.players.find(p => p.playerId === action.playerId);
        if (!player || !player.isAlive) return state;

        switch (action.type) {
            case "INCOME":
                player.coins += 1;
                break;

            case "FOREIGN_AID":
                // Can be blocked by Duke
                state.pendingAction = { type: "FOREIGN_AID", fromPlayerId: player.playerId };
                break;

            case "TAX":
                // Claim Duke → subject to challenge
                state.pendingAction = { type: "TAX", fromPlayerId: player.playerId };
                break;

            case "COUP":
                player.coins -= 7;
                this.loseInfluence(state, action.payload.targetId);
                break;

            case "ASSASSINATE":
                player.coins -= 3;
                state.pendingAction = { type: "ASSASSINATE", fromPlayerId: player.playerId, toPlayerId: action.payload.targetId };
                break;

            case "STEAL":
                state.pendingAction = { type: "STEAL", fromPlayerId: player.playerId, toPlayerId: action.payload.targetId };
                break;

            case "EXCHANGE":
                state.pendingAction = { type: "EXCHANGE", fromPlayerId: player.playerId };
                break;

            case "BLOCK":
                // Resolve block, might require challenge
                if (state.pendingAction && state.pendingAction.type && state.pendingAction.fromPlayerId) {
                    state.pendingAction = {
                        type: state.pendingAction.type,
                        fromPlayerId: state.pendingAction.fromPlayerId,
                        toPlayerId: state.pendingAction.toPlayerId,
                        blockedBy: action.playerId
                    };
                }
                break;

            case "CHALLENGE":
                this.resolveChallenge(state, action.payload.targetId, action.playerId);
                break;

            case "RESOLVE_ACTION":
                // Called after all block/challenge opportunities passed
                this.resolvePendingAction(state);
                break;
        }

        if (action.type !== "CHALLENGE" && action.type !== "BLOCK" && action.type !== "RESOLVE_ACTION") {
            this.advanceTurn(state);
        }

        return state;
    }

    private resolveChallenge(state: CoupGameState, claimedPlayerId: string, challengerId: string) {
        const claimedPlayer = state.players.find(p => p.playerId === claimedPlayerId);
        const challenger = state.players.find(p => p.playerId === challengerId);
        if (!claimedPlayer || !challenger) return;

        const pendingType = state.pendingAction?.type;
        const requiredCard = this.getRequiredCardForAction(pendingType!);

        if (claimedPlayer.influence.includes(requiredCard)) {
            // Claimed player wins → challenger loses influence
            this.loseInfluence(state, challengerId);
            // Replace revealed card
            claimedPlayer.influence = claimedPlayer.influence.filter(c => c !== requiredCard);
            state.deck.push(requiredCard);
            state.deck = this.shuffle(state.deck);
            claimedPlayer.influence.push(state.deck.pop()!);
        } else {
            // Claimed player loses influence
            this.loseInfluence(state, claimedPlayerId);
            // Action is canceled
            state.pendingAction = undefined;
        }
    }

    private getRequiredCardForAction(actionType: string): CoupCard {
        switch (actionType) {
            case "TAX": return "Duke";
            case "ASSASSINATE": return "Assassin";
            case "STEAL": return "Captain";
            case "EXCHANGE": return "Ambassador";
            default: throw new Error(`No card requirement for ${actionType}`);
        }
    }

    private resolvePendingAction(state: CoupGameState) {
        const action = state.pendingAction;
        if (!action) return;
        const from = state.players.find(p => p.playerId === action.fromPlayerId);
        const to = action.toPlayerId ? state.players.find(p => p.playerId === action.toPlayerId) : undefined;
        if (!from || (action.toPlayerId && !to)) return;

        switch (action.type) {
            case "FOREIGN_AID":
                from.coins += 2;
                break;
            case "TAX":
                from.coins += 3;
                break;
            case "ASSASSINATE":
                this.loseInfluence(state, to!.playerId);
                break;
            case "STEAL":
                const stolen = Math.min(2, to!.coins);
                to!.coins -= stolen;
                from.coins += stolen;
                break;
            case "EXCHANGE":
                const drawn = [state.deck.pop()!, state.deck.pop()!];
                const combined = [...drawn, ...from.influence];
                // For now, auto-pick first two → later add choice via frontend
                from.influence = combined.slice(0, 2);
                state.deck.push(...combined.slice(2));
                state.deck = this.shuffle(state.deck);
                break;
        }
        state.pendingAction = undefined;
    }



    private loseInfluence(state: CoupGameState, targetId: string) {
        const target = state.players.find(p => p.playerId === targetId);
        if (!target) return;
        if (target.influence.length > 0) {
            const lostCard = target.influence.pop()!;
            target.revealedCards.push(lostCard);
        }
        if (target.influence.length === 0) {
            target.isAlive = false;
            this.checkWinner(state);
        }
    }

    private advanceTurn(state: CoupGameState) {
        const alivePlayers = state.players.filter(p => p.isAlive);
        const currentIndex = alivePlayers.findIndex(p => p.playerId === state.currentTurnPlayerId);
        const nextIndex = (currentIndex + 1) % alivePlayers.length;
        state.currentTurnPlayerId = alivePlayers[nextIndex].playerId;
    }

    private checkWinner(state: CoupGameState) {
        const alivePlayers = state.players.filter(p => p.isAlive);
        if (alivePlayers.length === 1) {
            state.winnerId = alivePlayers[0].playerId;
        }
    }
}

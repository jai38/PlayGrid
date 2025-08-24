// CORE-030: Movement Module - Pure functions for token movement and position handling
import { MonopolyGameState, MonopolyPlayer, BoardSpace } from '../MonopolyGame';

export class MovementModule {
    private static readonly GO_SALARY = 200;
    private static readonly GO_POSITION = 0;

    // CORE-003: Pure function for calculating new position after dice roll
    static calculateNewPosition(currentPosition: number, diceTotal: number): number {
        return (currentPosition + diceTotal) % 40;
    }

    // CORE-005: Pure function to check if player passed GO
    static hasPassedGO(oldPosition: number, newPosition: number): boolean {
        return oldPosition > newPosition || (oldPosition !== 0 && newPosition === 0);
    }

    // CORE-028: Enhanced movement for card-based moves with GO salary
    static movePlayerToPosition(
        player: MonopolyPlayer, 
        newPosition: number, 
        reason: string = "dice"
    ): { player: MonopolyPlayer; passedGO: boolean; goSalary: number } {
        const oldPosition = player.position;
        const updatedPlayer = { ...player, position: newPosition % 40 };
        
        // Check if passed GO during movement
        const passedGO = reason === "card" && this.hasPassedGO(oldPosition, updatedPlayer.position);
        const goSalary = passedGO ? this.GO_SALARY : 0;
        
        if (passedGO) {
            updatedPlayer.money += this.GO_SALARY;
        }

        return {
            player: updatedPlayer,
            passedGO,
            goSalary
        };
    }

    // CORE-028: Apply GO salary for regular dice movement
    static applyGOSalary(player: MonopolyPlayer, oldPosition: number, newPosition: number): MonopolyPlayer {
        if (this.hasPassedGO(oldPosition, newPosition)) {
            return {
                ...player,
                money: player.money + this.GO_SALARY
            };
        }
        return player;
    }

    // Pure function to get board space by position
    static getBoardSpace(board: BoardSpace[], position: number): BoardSpace {
        return board[position];
    }
}
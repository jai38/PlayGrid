// src/games/monopoly/utils/diceRoller.ts

export interface DiceRoll {
    die1: number;
    die2: number;
    total: number;
    isDouble: boolean;
}

/**
 * Roll two six-sided dice
 */
export function rollDice(): DiceRoll {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const isDouble = die1 === die2;
    return { die1, die2, total, isDouble };
}

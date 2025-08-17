"use strict";
// src/games/monopoly/utils/diceRoller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollDice = rollDice;
/**
 * Roll two six-sided dice
 */
function rollDice() {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const isDouble = die1 === die2;
    return { die1, die2, total, isDouble };
}

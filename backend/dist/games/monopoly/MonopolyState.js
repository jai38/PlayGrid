"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialState = createInitialState;
const board_1 = require("./board");
function createInitialState(playerNames) {
    const players = playerNames.map((name, idx) => ({
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
        board: board_1.monopolyBoard,
        currentPlayerIndex: 0,
        dice: null,
        houses: {},
        phase: "waiting",
        logs: ["Game started."],
    };
}

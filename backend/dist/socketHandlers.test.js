"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const socket_1 = require("./socket");
const rooms = __importStar(require("./rooms"));
const GameManager_1 = require("./games/GameManager");
const CoupGame_1 = require("./games/coup/CoupGame");
jest.mock("./rooms");
jest.mock("./games/GameManager");
describe("Socket event handlers", () => {
    let io;
    let socket;
    let mockGameManager;
    beforeEach(() => {
        io = {
            on: jest.fn(),
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        };
        socket = {
            id: "socket1",
            on: jest.fn(),
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
            rooms: new Set(),
        };
        mockGameManager = {
            registerGame: jest.fn(),
            startGame: jest.fn(),
            getGameInstance: jest.fn(),
            getGameState: jest.fn(),
            handleAction: jest.fn(),
        };
        GameManager_1.GameManager.mockImplementation(() => mockGameManager);
        jest.clearAllMocks();
    });
    const triggerConnection = () => {
        const connectionHandler = io.on.mock.calls.find((c) => c[0] === "connection")[1];
        connectionHandler(socket);
    };
    test("registers CoupGame on init", () => {
        (0, socket_1.initSocket)(io);
        expect(mockGameManager.registerGame).toHaveBeenCalledWith(expect.any(CoupGame_1.CoupGame));
    });
    describe("Events", () => {
        beforeEach(() => {
            (0, socket_1.initSocket)(io);
            triggerConnection();
        });
        test("getRooms", () => {
            rooms.getAllRooms.mockReturnValue([{ id: "r1" }]);
            const ack = jest.fn();
            const getRoomsCall = socket.on.mock.calls.find(([e]) => e === "getRooms");
            expect(getRoomsCall).toBeDefined();
            const handler = getRoomsCall && getRoomsCall[1];
            if (handler) {
                handler(ack);
            }
            expect(ack).toHaveBeenCalledWith([{ id: "r1" }]);
        });
        test("createRoom success", () => {
            const payload = { roomName: "Test", playerName: "Alice" };
            const room = { roomId: "room1" };
            const player = { playerId: "p1" };
            rooms.createRoom.mockReturnValue(room);
            rooms.addPlayerToRoom.mockReturnValue(player);
            rooms.getFullRoomData.mockReturnValue({ players: [] });
            rooms.getPublicRoomsSummary.mockReturnValue([]);
            const ack = jest.fn();
            const createRoomCall = socket.on.mock.calls.find(([e]) => e === "createRoom");
            expect(createRoomCall).toBeDefined();
            const handler = createRoomCall && createRoomCall[1];
            if (handler) {
                handler(payload, ack);
            }
            expect(socket.join).toHaveBeenCalledWith("room1");
            expect(io.emit).toHaveBeenCalledWith("rooms:update", []);
            expect(socket.emit).toHaveBeenCalledWith("room:joined", {
                room: { players: [] },
                player,
            });
            expect(ack).toHaveBeenCalledWith({ success: true, roomId: "room1" });
        });
        test("createRoom error", () => {
            const payload = { roomName: "Test", playerName: "Alice" };
            rooms.createRoom.mockImplementation(() => {
                throw new Error("fail");
            });
            const ack = jest.fn();
            const createRoomCall = socket.on.mock.calls.find(([e]) => e === "createRoom");
            expect(createRoomCall).toBeDefined();
            const handler = createRoomCall && createRoomCall[1];
            if (handler) {
                handler(payload, ack);
            }
            expect(io.emit).toHaveBeenCalledWith("errorMessage", expect.any(Object));
            expect(ack).toHaveBeenCalledWith({ success: false, error: "Failed to create room" });
        });
        test("joinRoom success", () => {
            const room = { roomId: "r1", players: [] };
            rooms.getRoom.mockReturnValue(room);
            rooms.addPlayerToRoom.mockReturnValue({ playerId: "p1" });
            rooms.getFullRoomData.mockReturnValue({ players: [] });
            rooms.getPublicRoomsSummary.mockReturnValue([]);
            const joinRoomCall = socket.on.mock.calls.find(([e]) => e === "joinRoom");
            expect(joinRoomCall).toBeDefined();
            const handler = joinRoomCall && joinRoomCall[1];
            const ack = jest.fn();
            if (handler) {
                handler({ roomId: "r1", playerName: "Bob" }, ack);
            }
            expect(socket.join).toHaveBeenCalledWith("r1");
            expect(io.emit).toHaveBeenCalledWith("rooms:update", []);
            expect(socket.emit).toHaveBeenCalledWith("room:joined", expect.any(Object));
            expect(ack).toHaveBeenCalledWith({ success: true });
        });
        test("joinRoom room not found", () => {
            rooms.getRoom.mockReturnValue(null);
            const joinRoomCall = socket.on.mock.calls.find(([e]) => e === "joinRoom");
            expect(joinRoomCall).toBeDefined();
            const handler = joinRoomCall && joinRoomCall[1];
            const ack = jest.fn();
            if (handler) {
                handler({ roomId: "bad", playerName: "Bob" }, ack);
            }
            expect(io.emit).toHaveBeenCalledWith("errorMessage", expect.any(Object));
            expect(ack).toHaveBeenCalledWith({ success: false, error: "Room_not_found" });
        });
        test("sendMessage success", () => {
            const sendMessage = socket.on.mock.calls.find(([e]) => e === "sendMessage");
            expect(sendMessage).toBeDefined();
            const handler = sendMessage && sendMessage[1];
            const ack = jest.fn();
            if (handler) {
                handler({ roomId: "r1", playerId: "p1", message: "hi" }, ack);
            }
            expect(io.to).toHaveBeenCalledWith("r1");
            expect(io.emit).not.toHaveBeenCalledWith(expect.stringMatching(/error/i), expect.anything());
            expect(ack).toHaveBeenCalledWith({ success: true });
        });
        test("game:start success", () => {
            const room = { players: [], game: {} };
            rooms.getRoom.mockReturnValue(room);
            mockGameManager.getGameInstance.mockReturnValue({});
            mockGameManager.getGameState.mockReturnValue({});
            const gameStartCall = socket.on.mock.calls.find(([e]) => e === "game:start");
            expect(gameStartCall).toBeDefined();
            const handler = gameStartCall && gameStartCall[1];
            if (handler) {
                handler({ roomId: "r1", gameId: "coup" });
            }
            expect(mockGameManager.startGame).toHaveBeenCalled();
            expect(io.to).toHaveBeenCalledWith("r1");
            expect(io.emit).not.toHaveBeenCalledWith("game:error", expect.anything());
        });
        test("game:action success", () => {
            const room = { players: [{ playerId: "p1" }] };
            rooms.getRoom.mockReturnValue(room);
            mockGameManager.getGameState.mockReturnValue({
                players: [{ playerId: "p1", influence: [] }],
            });
            const gameActionCall = socket.on.mock.calls.find(([e]) => e === "game:action");
            expect(gameActionCall).toBeDefined();
            const handler = gameActionCall && gameActionCall[1];
            if (handler) {
                handler({ roomId: "r1", action: { type: "MOVE" } });
            }
            expect(mockGameManager.handleAction).toHaveBeenCalled();
            expect(io.to).toHaveBeenCalledWith("r1");
        });
    });
});

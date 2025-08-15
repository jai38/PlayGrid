// __tests__/socketHandlers.test.ts
import { Server, Socket } from "socket.io";
import { initSocket } from "./socket";
import * as rooms from "./rooms";
import { GameManager } from "./games/GameManager";
import { CoupGame } from "./games/coup/CoupGame";

jest.mock("./rooms");
jest.mock("./games/GameManager");

describe("Socket event handlers", () => {
    let io: jest.Mocked<Server>;
    let socket: jest.Mocked<Socket>;
    let mockGameManager: any;

    beforeEach(() => {
        io = {
            on: jest.fn(),
            emit: jest.fn(),
            to: jest.fn().mockReturnThis(),
        } as any;

        socket = {
            id: "socket1",
            on: jest.fn(),
            emit: jest.fn(),
            join: jest.fn(),
            leave: jest.fn(),
            rooms: new Set(),
        } as any;

        mockGameManager = {
            registerGame: jest.fn(),
            startGame: jest.fn(),
            getGameInstance: jest.fn(),
            getGameState: jest.fn(),
            handleAction: jest.fn(),
        };
        (GameManager as jest.Mock).mockImplementation(() => mockGameManager);
        jest.clearAllMocks();
    });

    const triggerConnection = () => {
        const connectionHandler = (io.on as jest.Mock).mock.calls.find(
            (c) => c[0] === "connection"
        )[1];
        connectionHandler(socket);
    };

    test("registers CoupGame on init", () => {
        initSocket(io);
        expect(mockGameManager.registerGame).toHaveBeenCalledWith(expect.any(CoupGame));
    });

    describe("Events", () => {
        beforeEach(() => {
            initSocket(io);
            triggerConnection();
        });

        test("getRooms", () => {
            (rooms.getAllRooms as jest.Mock).mockReturnValue([{ id: "r1" }]);
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
            (rooms.createRoom as jest.Mock).mockReturnValue(room);
            (rooms.addPlayerToRoom as jest.Mock).mockReturnValue(player);
            (rooms.getFullRoomData as jest.Mock).mockReturnValue({ players: [] });
            (rooms.getPublicRoomsSummary as jest.Mock).mockReturnValue([]);

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
            (rooms.createRoom as jest.Mock).mockImplementation(() => {
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
            (rooms.getRoom as jest.Mock).mockReturnValue(room);
            (rooms.addPlayerToRoom as jest.Mock).mockReturnValue({ playerId: "p1" });
            (rooms.getFullRoomData as jest.Mock).mockReturnValue({ players: [] });
            (rooms.getPublicRoomsSummary as jest.Mock).mockReturnValue([]);

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
            (rooms.getRoom as jest.Mock).mockReturnValue(null);
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
            (rooms.getRoom as jest.Mock).mockReturnValue(room);
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
            (rooms.getRoom as jest.Mock).mockReturnValue(room);
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

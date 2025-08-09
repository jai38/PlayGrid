import { Server, Socket } from "socket.io";
import {
    createRoom,
    addPlayerToRoom,
    getPublicRoomsSummary,
    getFullRoomData,
    getRoom,
    getAllRooms,
    markPlayerDisconnected,
    removePlayerById
} from "./rooms";

type CreateRoomPayload = {
    roomName: string;
    isPrivate?: boolean;
    password?: string;
    playerName: string;
    maxPlayers?: number;
};

type JoinRoomPayload = {
    roomId: string;
    playerName: string;
    playerId?: string;
    password?: string;
};

type ChatPayload = {
    roomId: string;
    playerId: string;
    message: string;
    senderName?: string;
};

function safeAck(ack: any, payload: any) {
    if (typeof ack === "function") {
        ack(payload);
    }
}

export function initSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("getRooms", (ack) => {
            if (typeof ack === "function") {
                ack(getAllRooms()); // return the rooms directly to the requester
            }
        });

        socket.emit("rooms:update", getPublicRoomsSummary());

        socket.on("createRoom", (payload: CreateRoomPayload, ack?: (res: any) => void) => {
            try {
                const { roomName, isPrivate = false, password, playerName, maxPlayers } = payload;
                const room = createRoom(roomName, isPrivate, password ?? null, maxPlayers);
                const player = addPlayerToRoom(room.roomId, socket.id, playerName, undefined, true);
                socket.join(room.roomId);
                const full = getFullRoomData(room.roomId);
                io.emit("rooms:update", getPublicRoomsSummary());
                socket.emit("room:joined", { room: full, player });
                safeAck(ack, { success: true, roomId: room.roomId });

                // Send player list to ONLY this room, including roomId for frontend filtering
                io.to(room.roomId).emit("players:update", {
                    roomId: room.roomId,
                    players: full?.players ?? []
                });
            } catch (err) {
                console.error("createRoom error", err);
                io.emit("errorMessage", { type: "error", message: "Failed to create room" });
                safeAck(ack, { success: false, error: "Failed to create room" });
            }
        });

        socket.on("joinRoom", (payload: JoinRoomPayload, ack?: (res: any) => void) => {
            try {
                const { roomId, playerName, playerId, password } = payload;
                const room = getRoom(roomId);

                if (!room) {
                    io.emit("errorMessage", { type: "error", message: "Room not found" });
                    return safeAck(ack, { success: false, error: "Room_not_found" })
                };

                if (room.isPrivate && room.password && room.password !== password) {
                    io.emit("errorMessage", { type: "error", message: "Invalid Password" });
                    return safeAck(ack, { success: false, error: "Invalid_password" });
                }

                const player = addPlayerToRoom(roomId, socket.id, playerName, playerId, false);
                if (!player) {
                    io.emit("errorMessage", { type: "error", message: "Room is full or could not join" });
                    return safeAck(ack, { success: false, error: "Room_full_or_could_not_join" })
                };

                // Make sure socket is ONLY in its own private socket room + this game room
                for (const r of socket.rooms) {
                    if (r !== socket.id && r !== roomId) {
                        socket.leave(r);
                    }
                }

                socket.join(roomId);

                const full = getFullRoomData(roomId);

                // Broadcast updated rooms list to everyone in lobby
                io.emit("rooms:update", getPublicRoomsSummary());



                // Send joined confirmation to THIS player
                socket.emit("room:joined", { room: full, player });

                // Send player list to ONLY this room, including roomId for frontend filtering
                setTimeout(() => {
                    io.to(roomId).emit("players:update", {
                        roomId,
                        players: full?.players ?? []
                    });
                }, 500);

                safeAck(ack, { success: true });
            } catch (err) {
                console.error("joinRoom error", err);
                io.emit("errorMessage", { type: "error", message: "Failed to join room" });
                safeAck(ack, { success: false, error: "Failed to join room" });
            }
        });

        socket.on("getCurrentPlayers", (payload: { roomId: string }, ack?: (players: any[]) => void) => {
            try {
                const { roomId } = payload;
                const room = getRoom(roomId);
                if (!room) return safeAck(ack, []);

                const players = room.players;
                safeAck(ack, players);
            }
            catch (err) {
                io.emit("errorMessage", { type: "error", message: "Failed to get current players" });
                console.error("getCurrentPlayers error", err);
                safeAck(ack, []);
            }
        });


        socket.on("leaveRoom", (payload: { roomId: string; playerId?: string }, ack?: (res: any) => void) => {
            try {
                const { roomId, playerId } = payload;
                if (playerId) {
                    removePlayerById(roomId, playerId);
                } else {
                    markPlayerDisconnected(roomId, socket.id);
                }
                socket.leave(roomId);
                io.emit("rooms:update", getPublicRoomsSummary());
                const full = getFullRoomData(roomId);
                io.to(roomId).emit("players:update", roomId, full?.players ?? []);
                safeAck(ack, { success: true });
            } catch (err) {
                console.error("leaveRoom error", err);
                io.emit("errorMessage", { type: "error", message: "Failed to leave room" })
                safeAck(ack, { success: false, error: "Failed to leave room" });
            }
        });

        socket.on("sendMessage", (payload: ChatPayload, ack?: (res: any) => void) => {
            try {
                const { roomId, playerId, message, senderName } = payload;
                const ts = Date.now();
                const msg = {
                    senderName: senderName ?? "anon",
                    playerId,
                    message,
                    timestamp: ts
                };
                io.to(roomId).emit("chat:message", msg);
                safeAck(ack, { success: true });
            } catch (err) {
                console.error("sendMessage error", err);
                io.emit("errorMessage", { type: "error", message: "Failed to send message" });
                safeAck(ack, { success: false, error: "Failed to send message" });
            }
        });

        socket.on("reconnectToRoom", (payload: { roomId: string; playerId: string; playerName?: string }, ack?: (res: any) => void) => {
            try {
                const { roomId, playerId, playerName } = payload;
                const player = addPlayerToRoom(roomId, socket.id, playerName ?? "reconnected", playerId, false);
                if (!player) return safeAck(ack, { success: false, error: "Could not reconnect" });

                socket.join(roomId);
                const full = getFullRoomData(roomId);
                io.emit("rooms:update", getPublicRoomsSummary());
                io.to(roomId).emit("players:update", full?.players ?? []);
                socket.emit("room:joined", { room: full, player });
                safeAck(ack, { success: true });
            } catch (err) {
                console.error("reconnectToRoom error", err);
                io.emit("errorMessage", { type: "error", message: "Reconnect failed" });
                safeAck(ack, { success: false, error: "Reconnect failed" });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected", socket.id, reason);
            const roomsJoined = Array.from(socket.rooms).filter(r => r !== socket.id);
            roomsJoined.forEach(rid => {
                try {
                    markPlayerDisconnected(rid, socket.id);
                    const full = getFullRoomData(rid);
                    io.to(rid).emit("players:update", rid, full?.players ?? []);
                    io.emit("rooms:update", getPublicRoomsSummary());
                } catch (err) {
                    console.error("Error handling disconnect for room", rid, err);
                }
            });
        });
    });
}

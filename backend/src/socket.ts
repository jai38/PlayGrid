import { Server, Socket } from "socket.io";
import {
    createRoom,
    addPlayerToRoom,
    getPublicRoomsSummary,
    getFullRoomData,
    getRoom,
    markPlayerDisconnected,
    removePlayerById
} from "./rooms";

/**
 * Socket event names and payload shapes are kept simple for Phase 1.
 *
 * Events:
 * - createRoom (client -> server)
 * - joinRoom (client -> server)
 * - leaveRoom (client -> server)
 * - sendMessage (client -> server)
 * - reconnectToRoom (client -> server)
 *
 * Server emits:
 * - rooms:update (to lobby)
 * - room:joined (to joining socket)
 * - players:update (to room)
 * - chat:message (to room)
 * - error (to socket)
 */

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
    playerId?: string; // optional stable id to reconnect
    password?: string;
};

type ChatPayload = {
    roomId: string;
    playerId: string;
    message: string;
    senderName?: string;
};

export function initSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        // send initial public rooms list
        socket.emit("rooms:update", getPublicRoomsSummary());

        socket.on("createRoom", (payload: CreateRoomPayload, ack: (res: any) => void) => {
            try {
                const { roomName, isPrivate = false, password, playerName, maxPlayers } = payload;
                const room = createRoom(roomName, isPrivate, password ?? null, maxPlayers);
                // add player as host
                const player = addPlayerToRoom(room.roomId, socket.id, playerName, undefined, true);
                // join socket.io room
                socket.join(room.roomId);
                // reply to creator with full room data
                const full = getFullRoomData(room.roomId);
                // broadcast rooms update to everyone in lobby
                io.emit("rooms:update", getPublicRoomsSummary());
                // emit room:joined to the creator
                socket.emit("room:joined", { room: full, player });
                // notify room players (only one now)
                io.to(room.roomId).emit("players:update", full?.players ?? []);
                ack({ success: true, roomId: room.roomId });
            } catch (err) {
                console.error("createRoom error", err);
                ack({ success: false, error: "Failed to create room" });
            }
        });

        socket.on("joinRoom", (payload: JoinRoomPayload, ack: (res: any) => void) => {
            try {
                const { roomId, playerName, playerId, password } = payload;
                const room = getRoom(roomId);
                if (!room) {
                    ack({ success: false, error: "Room_not_found" });
                    return;
                }
                if (room.isPrivate && room.password && room.password !== password) {
                    ack({ success: false, error: "Invalid_password" });
                    return;
                }
                const player = addPlayerToRoom(roomId, socket.id, playerName, playerId, false);
                if (!player) {
                    ack({ success: false, error: "Room_full_or_could_not_join" });
                    return;
                }
                socket.join(roomId);
                const full = getFullRoomData(roomId);
                // notify lobby about updated rooms
                io.emit("rooms:update", getPublicRoomsSummary());
                // notify room members
                io.to(roomId).emit("players:update", full?.players ?? []);
                socket.emit("room:joined", { room: full, player });
                ack({ success: true });
            } catch (err) {
                console.error("joinRoom error", err);
                ack({ success: false, error: "Failed to join room" });
            }
        });

        socket.on("leaveRoom", (payload: { roomId: string; playerId?: string }, ack?: (res: any) => void) => {
            try {
                const { roomId, playerId } = payload;
                if (playerId) {
                    // immediate remove; client intentionally leaving
                    removePlayerById(roomId, playerId);
                } else {
                    // fallback: try to find by socket id and mark disconnected
                    markPlayerDisconnected(roomId, socket.id);
                }
                socket.leave(roomId);
                io.emit("rooms:update", getPublicRoomsSummary());
                const full = getFullRoomData(roomId);
                io.to(roomId).emit("players:update", full?.players ?? []);
                ack && ack({ success: true });
            } catch (err) {
                console.error("leaveRoom error", err);
                ack && ack({ success: false, error: "Failed to leave room" });
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
                // broadcast to room
                io.to(roomId).emit("chat:message", msg);
                ack && ack({ success: true });
            } catch (err) {
                console.error("sendMessage error", err);
                ack && ack({ success: false, error: "Failed to send message" });
            }
        });

        socket.on("reconnectToRoom", (payload: { roomId: string; playerId: string; playerName?: string }, ack?: (res: any) => void) => {
            try {
                const { roomId, playerId, playerName } = payload;
                // attempt to re-add player with same playerId
                const player = addPlayerToRoom(roomId, socket.id, playerName ?? "reconnected", playerId, false);
                if (!player) {
                    ack && ack({ success: false, error: "Could not reconnect" });
                    return;
                }
                socket.join(roomId);
                const full = getFullRoomData(roomId);
                io.emit("rooms:update", getPublicRoomsSummary());
                io.to(roomId).emit("players:update", full?.players ?? []);
                socket.emit("room:joined", { room: full, player });
                ack && ack({ success: true });
            } catch (err) {
                console.error("reconnectToRoom error", err);
                ack && ack({ success: false, error: "Reconnect failed" });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected", socket.id, reason);
            // On disconnect we find any room the socket was part of and mark disconnected
            // Simple iteration — ok for Phase 1
            // Marking disconnected so client can reconnect within grace period
            const roomsJoined = Array.from(socket.rooms).filter(r => r !== socket.id);
            roomsJoined.forEach(rid => {
                try {
                    markPlayerDisconnected(rid, socket.id);
                    // broadcast updated player list to other clients (they will see disconnected flag eventually)
                    const full = getFullRoomData(rid);
                    io.to(rid).emit("players:update", full?.players ?? []);
                    io.emit("rooms:update", getPublicRoomsSummary());
                } catch (err) {
                    console.error("Error handling disconnect for room", rid, err);
                }
            });
        });
    });
}

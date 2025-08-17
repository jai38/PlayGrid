"use strict";
/**
 * In-memory room manager for Phase 1.
 *
 * - Stores rooms in a Map
 * - Keeps disconnected players for a short grace period so refresh/reconnect works
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
exports.getRoom = getRoom;
exports.getAllRooms = getAllRooms;
exports.getPublicRoomsSummary = getPublicRoomsSummary;
exports.addPlayerToRoom = addPlayerToRoom;
exports.markPlayerDisconnected = markPlayerDisconnected;
exports.removePlayerById = removePlayerById;
exports.removePlayerBySocket = removePlayerBySocket;
exports.getRoomPublicView = getRoomPublicView;
exports.getFullRoomData = getFullRoomData;
const idGenerator_1 = require("./utils/idGenerator");
const config_1 = require("./config");
const rooms = new Map();
function createRoom(name, isPrivate = false, password, maxPlayers = config_1.DEFAULT_MAX_PLAYERS) {
    const roomId = (0, idGenerator_1.generateId)();
    const room = {
        roomId,
        name,
        isPrivate,
        password: password ?? null,
        players: [],
        maxPlayers,
        createdAt: Date.now(),
        game: undefined
    };
    rooms.set(roomId, room);
    return room;
}
function getRoom(roomId) {
    return rooms.get(roomId) ?? null;
}
function getAllRooms() {
    return Array.from(rooms.values());
}
function getPublicRoomsSummary() {
    const arr = Array.from(rooms.values())
        .map(r => ({
        roomId: r.roomId,
        name: r.name,
        playerCount: r.players.length,
        players: r.players,
        maxPlayers: r.maxPlayers,
        createdAt: r.createdAt
    }));
    return arr;
}
/**
 * Add player to room. If playerId already exists (reconnect), updates socketId & clears disconnect timer.
 * Returns player object.
 */
function addPlayerToRoom(roomId, socketId, name, playerId, isHost = false) {
    const room = rooms.get(roomId);
    if (!room)
        return null;
    // if playerId provided, try find existing player
    let player;
    if (playerId) {
        player = room.players.find(p => p.playerId === playerId);
    }
    if (player) {
        // reconnecting player
        player.socketId = socketId;
        player.name = name; // update in case changed
        player.lastSeen = Date.now();
        if (player.disconnectedTimer) {
            clearTimeout(player.disconnectedTimer);
            player.disconnectedTimer = null;
        }
        return player;
    }
    if (room.players.length >= room.maxPlayers)
        return null;
    const newPlayer = {
        playerId: (0, idGenerator_1.generateId)(),
        socketId,
        name,
        isHost,
        lastSeen: Date.now(),
        disconnectedTimer: null
    };
    room.players.push(newPlayer);
    return newPlayer;
}
function markPlayerDisconnected(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    const p = room.players.find(pl => pl.socketId === socketId);
    if (!p)
        return;
    p.socketId = undefined;
    p.lastSeen = Date.now();
    // set a timer to remove player after grace period
    p.disconnectedTimer = setTimeout(() => {
        removePlayerById(roomId, p.playerId);
    }, config_1.ROOM_DISCONNECT_GRACE_MS);
}
function removePlayerById(roomId, playerId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    const idx = room.players.findIndex(p => p.playerId === playerId);
    if (idx >= 0) {
        const [removed] = room.players.splice(idx, 1);
        if (removed.disconnectedTimer) {
            clearTimeout(removed.disconnectedTimer);
        }
    }
    if (room.players.length === 0) {
        rooms.delete(roomId);
    }
    else {
        // ensure there is a host
        if (!room.players.some(p => p.isHost)) {
            room.players[0].isHost = true;
        }
    }
}
function removePlayerBySocket(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room)
        return;
    const p = room.players.find(pl => pl.socketId === socketId);
    if (!p)
        return;
    // treat as graceful disconnect: mark disconnected (so reconnect possible)
    markPlayerDisconnected(roomId, socketId);
}
function getRoomPublicView(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return null;
    return {
        roomId: room.roomId,
        name: room.name,
        isPrivate: room.isPrivate,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers
    };
}
function getFullRoomData(roomId) {
    const room = rooms.get(roomId);
    if (!room)
        return null;
    // only return sanitized player info
    return {
        roomId: room.roomId,
        name: room.name,
        isPrivate: room.isPrivate,
        players: room.players.map(p => ({
            playerId: p.playerId,
            name: p.name,
            isHost: p.isHost,
            connected: !!p.socketId
        })),
        maxPlayers: room.maxPlayers
    };
}

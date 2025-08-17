"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MAX_PLAYERS = exports.ROOM_DISCONNECT_GRACE_MS = exports.SERVER_PORT = void 0;
exports.SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
exports.ROOM_DISCONNECT_GRACE_MS = 90000; // 90 sec to allow reconnects on refresh/network blip
exports.DEFAULT_MAX_PLAYERS = 6;

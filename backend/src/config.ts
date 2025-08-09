export const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const ROOM_DISCONNECT_GRACE_MS = 90_000; // 90 sec to allow reconnects on refresh/network blip
export const DEFAULT_MAX_PLAYERS = 6;

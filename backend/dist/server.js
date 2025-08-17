"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./socket");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // tighten in prod
        methods: ["GET", "POST"]
    }
});
(0, socket_1.initSocket)(io);
httpServer.listen(config_1.SERVER_PORT, () => {
    console.log(`PlayGrid backend running on port ${config_1.SERVER_PORT}`);
});

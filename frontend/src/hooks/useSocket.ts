import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { setGlobalSocket } from "../services/socket";

const SOCKET_URL = "http://localhost:4000";

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;

export const useSocket = (onEvents?: (socket: Socket) => void) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Use global socket instance to prevent multiple connections
        if (!globalSocket) {
            const socketInstance = io(SOCKET_URL, {
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 500,
                timeout: 20000,
                forceNew: false
            });

            // Add connection event listeners
            socketInstance.on("connect", () => {
                console.log("Socket connected:", socketInstance.id);
            });

            socketInstance.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
            });

            socketInstance.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
            });

            socketInstance.on("reconnect", (attemptNumber) => {
                console.log("Socket reconnected after", attemptNumber, "attempts");
            });

            globalSocket = socketInstance;
            setGlobalSocket(socketInstance);
        }

        setSocket(globalSocket);

        // Register events whenever onEvents changes
        if (globalSocket && onEvents) {
            onEvents(globalSocket);
        }

        // Add page unload listener to properly disconnect
        const handleBeforeUnload = () => {
            if (globalSocket) {
                globalSocket.disconnect();
                globalSocket = null;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [onEvents]); // Include onEvents in deps to re-register when it changes

    return socket;
};

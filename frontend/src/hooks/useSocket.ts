import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export const useSocket = (onEvents?: (socket: Socket) => void) => {
    const socketRef = useRef<Socket | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Prevent multiple connections
        if (!socketRef.current) {
            const socketInstance = io(SOCKET_URL, {
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 500
            });

            socketRef.current = socketInstance;
            setSocket(socketInstance);

            if (onEvents) {
                onEvents(socketInstance);
            }

            // Clean up on unmount
            return () => {
                socketInstance.disconnect();
                socketRef.current = null;
                setSocket(null);
            };
        }
    }, []); // No onEvents in deps to avoid infinite reconnect

    return socket;
};

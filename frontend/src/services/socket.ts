import { io, Socket } from "socket.io-client";

// Use the same global socket instance as useSocket hook
let socket: Socket | null = null;

export const connectSocket = (url: string) => {
    if (!socket) {
        socket = io(url, { transports: ["websocket"] });
    }
    return socket;
};

export const getSocket = () => socket;

// Function to set the global socket instance (used by useSocket hook)
export const setGlobalSocket = (socketInstance: Socket) => {
    socket = socketInstance;
};

// export const joinRoom = (roomId: string, playerName: string) => {
//     socket?.emit("joinRoom", { roomId, playerName });
// };

// export const createRoom = (playerName: string) => {
//     socket?.emit("createRoom", { playerName });
// };
export const getRooms = (callback: (setRooms: any[]) => void) => {
    socket?.emit("getRooms", callback);
}

export const getCurrentPlayers = (roomId: string, callback: (players: any[]) => void) => {
    socket?.emit("getCurrentPlayers", { roomId }, callback);
}

export const createRoom = (playerName: string, roomName: string, isPrivate: boolean, password?: string, onSuccess?: (roomId: string) => void) => {
    socket?.emit("createRoom", { playerName, roomName, isPrivate, password }, (response: any) => {
        if (response.success) {
            localStorage.setItem("roomId", response.roomId);
            console.log(`Successfully created room ${response.roomId}`);
            if (onSuccess) {
                onSuccess(response.roomId);
            } else {
                // Fallback to window.location.href if no callback provided
                window.location.href = `/room/${response.roomId}`;
            }
        } else {
            console.error("Failed to create room:", response.error);
        }
    });
};

export const joinRoom = (roomId: string, playerName: string, playerId?: string, password?: string, onSuccess?: (roomId: string) => void) => {
    socket?.emit("joinRoom", { roomId, playerName, playerId, password }, (response: any) => {
        if (response.success) {
            localStorage.setItem("roomId", roomId);
            console.log(`Successfully joined room ${roomId}`);
            if (onSuccess) {
                onSuccess(roomId);
            } else {
                // Fallback to window.location.href if no callback provided
                window.location.href = `/room/${roomId}`;
            }
        } else {
            console.error("Failed to join room:", response.error);
        }
    });
};


// Listeners registration
export const onRoomsUpdate = (callback: (rooms: any[]) => void) => {
    socket?.on("rooms:update", callback);
};

export const onRoomJoined = (callback: (data: any) => void) => {
    socket?.on("room:joined", callback);
};

export const onPlayersUpdate = (callback: (data: any) => void) => {
    socket?.on("players:update", callback);
};

export const onErrorMessage = (callback: (msg: string) => void) => {
    socket?.on("errorMessage", callback);
};

export const gameStart = (socket: Socket | null, roomId: string, selectedGame: string, setError: (error: string) => void) => {

    socket?.emit("game:start", { roomId, gameId: selectedGame }, (response: any) => {
        if (response.success) {
            localStorage.setItem("gameId", selectedGame);
            // Use window.location.href for now since this is called from Room component
            // The Room component will handle the navigation via the game:started event
            console.log(`Game ${selectedGame} started in room ${roomId}`);
        } else {
            setError(response.error || "Failed to start game");
        }
    });
}

export const leaveRoom = (socket: Socket | null, roomId: string, playerId: string, onSuccess?: () => void) => {
    console.log(`Leaving room ${roomId} for player ${playerId}, socket:`, socket);
    socket?.emit("leaveRoom", { roomId, playerId }, (response: any) => {
        if (response.success) {
            localStorage.removeItem("roomId");
            localStorage.removeItem("currentRoom");
            console.log(`Successfully left room ${roomId}`);
            if (onSuccess) {
                onSuccess();
            } else {
                // Fallback to window.location.href if no callback provided
                window.location.href = "/lobby";
            }
        } else {
            console.error(response.error || "Failed to leave room");
        }
    });
}

export const reconnectToRoom = (roomId: string, playerId: string, playerName: string, onSuccess?: (hasActiveGame: boolean) => void) => {
    console.log(`Attempting to reconnect to room ${roomId} for player ${playerId}`);
    socket?.emit("reconnectToRoom", { roomId, playerId, playerName }, (response: any) => {
        if (response.success) {
            localStorage.setItem("roomId", roomId);
            console.log(`Successfully reconnected to room ${roomId}`);
            if (onSuccess) {
                onSuccess(response.hasActiveGame || false);
            }
        } else {
            console.error("Failed to reconnect to room:", response.error);
        }
    });
}

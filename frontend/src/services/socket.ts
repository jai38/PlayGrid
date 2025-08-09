import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (url: string) => {
    if (!socket) {
        socket = io(url, { transports: ["websocket"] });
    }
    return socket;
};

export const getSocket = () => socket;

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

export const createRoom = (playerName: string, roomName: string, isPrivate: boolean, password?: string) => {
    socket?.emit("createRoom", { playerName, roomName, isPrivate, password }, (response: any) => {
        if (response.success) {
            localStorage.setItem("roomId", response.roomId);
            window.location.href = `/room/${response.roomId}`;
        }
    });
};

export const joinRoom = (roomId: string, playerName: string, password?: string) => {
    socket?.emit("joinRoom", { roomId, playerName, password }, (response: any) => {
        if (response.success) {
            localStorage.setItem("roomId", roomId);
            window.location.href = `/room/${roomId}`;
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

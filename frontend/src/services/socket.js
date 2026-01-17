import io from 'socket.io-client';

let socket;
const SOCKET_URL = 'http://localhost:5000'; // Adjust if backend runs on different port

export const initializeSocket = () => {
    socket = io(SOCKET_URL, {
        autoConnect: false,
        reconnection: true,
    });
    return socket;
};

export const connectSocket = (userId) => {
    if (!socket) {
        initializeSocket();
    }
    if (!socket.connected) {
        socket.auth = { userId };
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
    }
};

export const getSocket = () => {
    return socket;
};

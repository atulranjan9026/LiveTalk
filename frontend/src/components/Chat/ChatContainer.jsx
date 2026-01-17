import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { initializeSocket, connectSocket, disconnectSocket, getSocket } from '../../services/socket';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import './Chat.css';

const ChatContainer = () => {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket
        const socketInstance = initializeSocket();
        setSocket(socketInstance);
        connectSocket(user.id);

        // Emit user_connected immediately so the server knows we are online
        socketInstance.emit('user_connected', user.id);

        // Re-emit on reconnection
        socketInstance.on('connect', () => {
            socketInstance.emit('user_connected', user.id);
        });

        // Socket event listeners
        socketInstance.on('online_users', (userIds) => {
            setOnlineUsers(userIds);
        });

        // Fetch users
        fetchUsers();

        // Cleanup
        return () => {
            disconnectSocket();
        };
    }, [user.id]);

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleUserSelect = (selectedUser) => {
        setSelectedUser(selectedUser);
    };

    const handleLogout = () => {
        disconnectSocket();
        logout();
    };

    return (
        <div className="chat-container">
            <div className="chat-layout">
                <UserList
                    users={users}
                    selectedUser={selectedUser}
                    onUserSelect={handleUserSelect}
                    onlineUsers={onlineUsers}
                    currentUser={user}
                    onLogout={handleLogout}
                />

                <ChatWindow
                    selectedUser={selectedUser}
                    currentUser={user}
                    socket={socket}
                />
            </div>
        </div>
    );
};

export default ChatContainer;

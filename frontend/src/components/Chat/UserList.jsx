import React from 'react';
import './Chat.css';

const UserList = ({ users, selectedUser, onUserSelect, onlineUsers, currentUser, onLogout }) => {
    const isOnline = (userId) => onlineUsers.includes(userId);

    return (
        <div className="user-list glass-effect">
            <div className="user-list-header">
                <div className="current-user-info">
                    <div className="user-avatar">
                        {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3>{currentUser.username}</h3>
                        <span className="online-status">Online</span>
                    </div>
                </div>
                <button onClick={onLogout} className="btn-logout" title="Logout">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </div>

            <div className="user-list-search">
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search users..."
                />
            </div>

            <div className="users-container">
                <h4 className="users-title">Messages</h4>
                {users.length === 0 ? (
                    <div className="no-users">No users available</div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user._id}
                            className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                            onClick={() => onUserSelect(user)}
                        >
                            <div className="user-avatar">
                                {user.username.charAt(0).toUpperCase()}
                                {isOnline(user._id) && <span className="online-indicator"></span>}
                            </div>
                            <div className="user-info">
                                <h4>{user.username}</h4>
                                <p className="user-status">
                                    {isOnline(user._id) ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserList;

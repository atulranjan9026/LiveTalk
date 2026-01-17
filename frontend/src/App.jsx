import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatContainer from './components/Chat/ChatContainer';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <ChatContainer />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/chat" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;

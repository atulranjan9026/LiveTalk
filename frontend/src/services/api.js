import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// const API_URL = 'http://localhost:5000/api' || process.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    verify: () => api.get('/auth/verify')
};

export const usersAPI = {
    getAll: () => api.get('/users')
};

export const messagesAPI = {
    getHistory: (userId) => api.get(`/messages/${userId}`),
    uploadImage: (formData) => api.post('/messages/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

export default api;

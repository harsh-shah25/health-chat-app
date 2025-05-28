// src/api/index.js
import axios from 'axios';

console.log('REACT_APP_API_BASE_URL in api/index.js:', process.env.REACT_APP_API_BASE_URL); // ADD THIS
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL, // THIS IS KEY!
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // IMPORTANT: Ensure the config.url is a relative path
        // (e.g., '/appointments/doctors') not an absolute one here,
        // as baseURL will be prepended.
        console.log('Axios Request Config:', config); // Add for debugging
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Response interceptor for debugging or global error handling
api.interceptors.response.use(
    (response) => {
        console.log('Axios Response:', response); // Add for debugging
        return response;
    },
    (error) => {
        console.error('Axios Error Response:', error.response); // Add for debugging
        console.error('Axios Error Config:', error.config);   // Add for debugging
        // Check if it's a 401 and if you have logic that might redirect
        if (error.response && error.response.status === 401) {
            // Be careful with global logout/redirect here.
            // It might be better handled in AuthContext or specific components.
            // Ensure any redirect uses router navigation, not window.location.href
            // to an incorrectly formed URL.
            console.error("Received 401 Unauthorized. Token might be invalid or expired.");
            // Example: Clearing token if a 401 happens, then relying on ProtectedRoute to redirect
            // localStorage.removeItem('authToken');
            // window.location.href = '/login'; // AVOID THIS if it causes the issue. Use React Router's navigate.
        }
        return Promise.reject(error);
    }
);

export default api;
import api from './index';

export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Assuming backend returns { token: "jwt_token", ...other details }
};

export const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data; // Assuming backend returns some confirmation or user data
};
// src/api/userService.js
import api from './index';

export const getAllProviders = async () => {
    const response = await api.get('/users/providers');
    return response.data;
};

export const getMyProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateMyProfile = async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
};

export const getAllChatUsers = async () => {
    try {
        const response = await api.get('/users'); // Replace with your actual endpoint
        return response.data;
    } catch (error) {
        console.warn("Failed to fetch all users for chat, falling back to providers list. Implement GET /api/users for full chat functionality.");
        const providersResponse = await api.get('/users/providers');
        return providersResponse.data;
    }
};

export const getUserProfileById = async (userId) => {
    if (!userId) {
        console.warn("getUserProfileById called with no userId");
        return null; // Or throw an error
    }
    try {
        const response = await api.get(`/users/${userId}`); // Calls GET /api/users/{userId} via API Gateway
        return response.data; // Should return UserProfile DTO { id, username, name, email, role, ... }
    } catch (error) {
        console.error(`Failed to fetch profile for user ${userId}:`, error.response || error);
        // Depending on how you want to handle errors, you could return null,
        // or a default object, or re-throw the error.
        // Returning null allows the calling component to handle the missing profile gracefully.
        return null;
    }
};
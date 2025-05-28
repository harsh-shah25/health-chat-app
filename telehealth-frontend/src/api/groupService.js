// src/api/groupService.js
import api from './index';

// Create a new group
export const createGroup = async (name) => {
    const response = await api.post('/groups', null, { params: { name } }); // Or send name in body if API expects that
    return response.data;
};

// List all groups
export const getAllGroups = async () => {
    const response = await api.get('/groups');
    return response.data;
};

// Join a group
export const joinGroup = async (groupId, username) => {
    const response = await api.post(`/groups/${groupId}/join`, null, { params: { username } });
    return response.data;
};

// Get list of group members
export const getGroupMembers = async (groupId) => {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
};

// Post a message in a group
export const postGroupMessage = async (groupId, sender, content) => {
    const response = await api.post(`/groups/${groupId}/messages`, null, { params: { sender, content } }); // Or send in body
    return response.data;
};

// Get all messages in a group
export const getGroupMessages = async (groupId) => {
    const response = await api.get(`/groups/${groupId}/messages`);
    return response.data;
};
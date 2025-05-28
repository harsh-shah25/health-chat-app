// src/api/messageService.js
import api from './index';

// Get conversation between two users
export const getConversation = async (user1, user2) => {
    const response = await api.get('/messages/conversation', { params: { user1, user2 } });
    return response.data;
};

// Send a new message
export const sendMessage = async (messageDetails) => { // { sender, receiver, content, etc. }
    const response = await api.post('/messages', messageDetails);
    return response.data;
};
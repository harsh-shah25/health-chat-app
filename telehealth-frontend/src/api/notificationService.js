// src/api/notificationService.js
import api from './index';

export const sendNotification = async (notificationDetails) => {
    // { channel, recipient, subject, message }
    const response = await api.post('/notifications', notificationDetails);
    return response.data;
};
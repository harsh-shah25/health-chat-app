// src/components/Messages/ChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getConversation, sendMessage as apiSendMessage } from '../../api/messageService';
import { getUserProfileById } from '../../api/userService'; // Still needed if message objects don't have senderName
import { useAuth } from '../../hooks/useAuth';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Avatar,
    IconButton, // For potential future actions in header
    Tooltip    // If you add icons with tooltips
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
// import InfoIcon from '@mui/icons-material/Info'; // Example if you want an info button for the other user
import { formatDateSafe } from '../../utils/dateUtils';

const ChatWindow = ({ otherUser }) => { // otherUser is a UserProfile object {id, username, name, ...}
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [userProfilesCache, setUserProfilesCache] = useState({}); // Cache for sender profiles
    const [loadingProfiles, setLoadingProfiles] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const updateProfileCache = useCallback((profile) => {
        if (profile && profile.id) {
            setUserProfilesCache(prevCache => ({
                ...prevCache,
                [profile.id]: profile,
            }));
        }
    }, []);

    useEffect(() => {
        if (currentUser) updateProfileCache(currentUser);
        if (otherUser) updateProfileCache(otherUser);
    }, [currentUser, otherUser, updateProfileCache]);

    const fetchConversation = useCallback(async () => {
        if (!currentUser?.id || !otherUser?.id) {
            setMessages([]);
            return;
        }
        setLoadingMessages(true);
        setError(null);
        try {
            const userId1 = currentUser.username;
            const userId2 = otherUser.username;
            const data = await getConversation(userId1, userId2);
            setMessages(Array.isArray(data) ? data.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)) : []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load conversation.');
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, [currentUser, otherUser]);

    useEffect(() => {
        if (otherUser?.id) {
            setMessages([]);
            if (currentUser) updateProfileCache(currentUser);
            updateProfileCache(otherUser);
            fetchConversation();
        } else {
            setMessages([]);
            setError(null);
        }
    }, [otherUser, currentUser, fetchConversation, updateProfileCache]);

    useEffect(() => {
        if (messages.length === 0) return;
        const newSenderIdsToFetch = messages
            .map(msg => msg.senderId)
            .filter((id, index, self) => id && !userProfilesCache[id] && self.indexOf(id) === index);

        if (newSenderIdsToFetch.length > 0) {
            setLoadingProfiles(true);
            const profilePromises = newSenderIdsToFetch.map(id =>
                getUserProfileById(id)
                    .then(profile => updateProfileCache(profile || { id, name: `User ID: ${id}`, username: `user_${id}`, isFallback: true }))
                    .catch(() => updateProfileCache({ id, name: `User ID: ${id}`, username: `user_${id}`, isFallback: true, errorFetching: true }))
            );
            Promise.all(profilePromises).finally(() => setLoadingProfiles(false));
        }
    }, [messages, userProfilesCache, updateProfileCache]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!currentUser?.id || !otherUser?.id) return () => {};
        const intervalId = setInterval(() => { if(document.hasFocus()) fetchConversation(); }, 15000);
        return () => clearInterval(intervalId);
    }, [fetchConversation, currentUser, otherUser]);

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!newMessage.trim() || !currentUser?.username || !otherUser?.username) {
            setError("Cannot send message: sender or receiver username is missing.");
            return;
        }
        setSending(true);
        setError(null);
        const optimisticMessage = {
            senderId: currentUser.id,
            sender: currentUser.username,
            receiver: otherUser.username,
            content: newMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        setNewMessage('');
        try {
            const messagePayload = {
                sender: currentUser.username,
                receiver: otherUser.username,
                content: optimisticMessage.content,
            };
            await apiSendMessage(messagePayload);
            fetchConversation();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to send message.');
            setMessages(prevMessages => prevMessages.filter(msg => msg.timestamp !== optimisticMessage.timestamp || (msg.id && msg.id !== optimisticMessage.id)));
        } finally {
            setSending(false);
            scrollToBottom();
        }
    };

    const getSenderDisplayName = (senderId) => {
        if (senderId === undefined || senderId === null) return 'Unknown';
        const profile = userProfilesCache[senderId];
        if (profile) return profile.name || profile.username || `User ID: ${senderId}`;
        return loadingProfiles ? 'Loading...' : `User ID: ${senderId}`;
    };

    if (!otherUser) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="h6" color="textSecondary">Select a user to start chatting.</Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
                        <Box p={2} sx={{ borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5 }}>
                        {otherUser.name?.charAt(0)?.toUpperCase() || otherUser.username?.charAt(0)?.toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="h6">{otherUser.name || otherUser.username}</Typography>
                </Box>
                                            </Box>

            {loadingMessages && messages.length === 0 && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>}

            <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.map((msg, index) => {
                    const isCurrentUserSender = msg.sender === currentUser.username;
                    // If backend message object includes senderName or sender (username), prioritize it
                    const senderDisplayName = msg.senderName || msg.sender || getSenderDisplayName(msg.senderId);

                    return (
                        <ListItem
                            key={msg.id || `msg-${index}-${msg.timestamp}`}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isCurrentUserSender ? 'flex-end' : 'flex-start',
                                mb: 1,
                            }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 1.5,
                                    borderRadius: isCurrentUserSender ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                    bgcolor: isCurrentUserSender ? 'primary.main' : 'grey.300',
                                    color: isCurrentUserSender ? 'primary.contrastText' : 'text.primary',
                                    maxWidth: '70%',
                                    wordBreak: 'break-word',
                                }}
                            >
                                <ListItemText
                                    primary={msg.content}
                                    secondary={
                                        <Typography variant="caption" component="span" sx={{color: isCurrentUserSender ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.5, display: 'block'}}>
                                            {senderDisplayName}
                                            {' - '}
                                            {msg.timestamp ? formatDateSafe(msg.timestamp, "p") : 'Sending...'}
                                        </Typography>
                                    }
                                />
                            </Paper>
                        </ListItem>
                    );
                })}
                <div ref={messagesEndRef} />
            </List>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={`Message ${otherUser.name || otherUser.username}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending || loadingMessages}
                    autoFocus
                />
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ ml: 1 }}
                    disabled={sending || loadingMessages || !newMessage.trim()}
                >
                    <SendIcon />
                </Button>
            </Box>
        </Paper>
    );
};

export default ChatWindow;
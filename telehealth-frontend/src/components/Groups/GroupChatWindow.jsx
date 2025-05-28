// src/components/Groups/GroupChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getGroupMessages, postGroupMessage, getGroupMembers } from '../../api/groupService';
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
    Avatar,  // Assuming Avatar might be used for sender later
    Drawer,
    IconButton,
    Tooltip,
    Divider // <--- ADD Divider HERE
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PeopleIcon from '@mui/icons-material/People';
import { formatDateSafe } from '../../utils/dateUtils'; // Assuming you created this utility

const GroupChatWindow = ({ group }) => {
    const { user: currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [membersDrawerOpen, setMembersDrawerOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchGroupDetails = useCallback(async () => {
        if (!group?.id || !currentUser) return;

        setLoadingMessages(true);
        setLoadingMembers(true);
        setError(null);
        try {
            const [messagesData, membersData] = await Promise.all([
                getGroupMessages(group.id),
                getGroupMembers(group.id)
            ]);
            setMessages(Array.isArray(messagesData) ? messagesData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : []); // Sort messages by timestamp
            setMembers(Array.isArray(membersData) ? membersData : []);
        } catch (err) {
            console.error(`Error fetching details for group ${group.id}:`, err.response || err);
            setError(err.response?.data?.message || err.message || 'Failed to load group details.');
            setMessages([]);
            setMembers([]);
        } finally {
            setLoadingMessages(false);
            setLoadingMembers(false);
        }
    }, [group, currentUser]);

    useEffect(() => {
        if (group?.id){ // Fetch only if a group is selected
            fetchGroupDetails();
        } else { // Clear data if no group selected
            setMessages([]);
            setMembers([]);
            setError(null);
        }
    }, [fetchGroupDetails, group]); // Re-fetch when group changes

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages
    useEffect(() => {
        if (!group?.id || !currentUser) return () => {};
        const intervalId = setInterval(() => {
            if (document.hasFocus()) fetchGroupDetails();
        }, 15000);
        return () => clearInterval(intervalId);
    }, [fetchGroupDetails, group, currentUser]);

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!newMessage.trim() || !currentUser?.username || !group?.id) return;

        setSending(true);
        setError(null);
        const optimisticMessage = {
            // No client-side ID to avoid issues with server-generated IDs
            sender: currentUser.username,
            content: newMessage,
            timestamp: new Date().toISOString(),
        };

        // Add to UI optimistically
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        // scrollToBottom(); // Scroll after optimistic update

        try {
            await postGroupMessage(group.id, currentUser.username, optimisticMessage.content);
            // Instead of removing optimistic and adding server one, just re-fetch for simplicity and consistency.
            // Server should ensure correct order and IDs.
            fetchGroupDetails();
        } catch (err) {
            console.error("Error sending group message:", err.response || err);
            setError(err.response?.data?.message || err.message || 'Failed to send message.');
            // Remove the optimistic message if send fails
            setMessages(prev => prev.filter(msg => msg.timestamp !== optimisticMessage.timestamp));
        } finally {
            setSending(false);
            scrollToBottom(); // Ensure scroll happens after send attempt
        }
    };

    const toggleMembersDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setMembersDrawerOpen(open);
    };

    if (!group) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="h6" color="textSecondary">Select a group to view messages.</Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
            <Box p={2} sx={{ borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{group.name || 'Group Chat'}</Typography>
                <Tooltip title="View Members">
                    <IconButton onClick={toggleMembersDrawer(true)}>
                        <PeopleIcon />
                        <Typography component="span" sx={{ml: 0.5, fontSize: '0.9rem'}}>({members.length})</Typography>
                    </IconButton>
                </Tooltip>
            </Box>

            {(loadingMessages && messages.length === 0) && <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>}

            <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.map((msg, index) => (
                    <ListItem
                        key={msg.id || `group-msg-${index}-${msg.timestamp}`} // msg.id from backend is preferred
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === currentUser.username ? 'flex-end' : 'flex-start',
                            mb: 1,
                        }}
                    >
                        <Paper
                            elevation={1}
                            sx={{
                                p: 1.5,
                                borderRadius: msg.sender === currentUser.username ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                bgcolor: msg.sender === currentUser.username ? 'primary.main' : 'grey.300',
                                color: msg.sender === currentUser.username ? 'primary.contrastText' : 'text.primary',
                                maxWidth: '70%',
                                wordBreak: 'break-word',
                            }}
                        >
                            <ListItemText
                                primary={msg.content}
                                secondary={
                                    <Typography variant="caption" component="span" sx={{color: msg.sender === currentUser.username ? 'rgba(255,255,255,0.7)' : 'text.secondary', mt: 0.5, display: 'block'}}>
                                        {msg.sender || 'Unknown Sender'}                                         {' - '}
                                        {msg.timestamp ? formatDateSafe(msg.timestamp, "p") : 'Sending...'}
                                    </Typography>
                                }
                            />
                        </Paper>
                    </ListItem>
                ))}
                <div ref={messagesEndRef} />
            </List>

            <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={`Message #${group.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending || loadingMessages}
                    autoFocus
                />
                <Button type="submit" variant="contained" sx={{ ml: 1 }} disabled={sending || loadingMessages || !newMessage.trim()}>
                    <SendIcon />
                </Button>
            </Box>

            <Drawer anchor="right" open={membersDrawerOpen} onClose={toggleMembersDrawer(false)}>
                <Box sx={{ width: 280, p: 2 }} role="presentation">
                    <Typography variant="h6" gutterBottom>Members of {group.name}</Typography>
                    <Divider sx={{mb:1}} />                     {loadingMembers ? <CircularProgress sx={{display: 'block', margin: '20px auto'}}/> : (
                        members.length > 0 ? (
                            <List>
                                {members.map((member, idx) => (
                                    <ListItem key={member.id || member.username || `member-${idx}`}>
                                                                                <ListItemText primary={member.name || member || 'Unknown Member'} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : <Typography>No members found or unable to load.</Typography>
                    )}
                </Box>
            </Drawer>
        </Paper>
    );
};

export default GroupChatWindow;
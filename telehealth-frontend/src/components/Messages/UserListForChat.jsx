// src/components/Messages/UserListForChat.jsx
import React, { useState, useEffect } from 'react';
import { getAllChatUsers } from '../../api/userService'; // Using our new conceptual function
import { useAuth } from '../../hooks/useAuth';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Alert, Paper, TextField, Box, Avatar, ListItemAvatar } from '@mui/material';

const UserListForChat = ({ onSelectUser, selectedUserId }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUser) return;
            setLoading(true);
            setError(null);
            try {
                let data = await getAllChatUsers();
                data = data || [];
                // Filter out the current user from the list
                const otherUsers = data.filter(u => u.id !== currentUser.id);
                setUsers(otherUsers);
                setFilteredUsers(otherUsers);
            } catch (err) {
                console.error("Error fetching users for chat:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
                setUsers([]);
                setFilteredUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser]);

    useEffect(() => {
        const results = users.filter(u =>
            (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>;

    return (
        <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' /* Adjust height as needed */ }}>
            <Box p={2}>
                <Typography variant="h6" gutterBottom>Contacts</Typography>
                <TextField
                    label="Search Users"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>
            {filteredUsers.length === 0 && !loading && <Typography sx={{p:2}}>No users found.</Typography>}
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                {filteredUsers.map((chatUser) => (
                    <ListItem key={chatUser.id || chatUser.username} disablePadding>
                        <ListItemButton
                            onClick={() => onSelectUser(chatUser)}
                            selected={selectedUserId === chatUser.id}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    {chatUser.name ? chatUser.name[0].toUpperCase() : (chatUser.username ? chatUser.username[0].toUpperCase() : '?')}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={chatUser.name || chatUser.username || 'Unknown User'}
                                secondary={chatUser.role === 'ROLE_PROVIDER' ? `Provider (${chatUser.specialization || ''})` : 'Patient'}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default UserListForChat;
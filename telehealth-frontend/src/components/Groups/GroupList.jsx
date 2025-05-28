// src/components/Groups/GroupList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllGroups, joinGroup } from '../../api/groupService';
import { useAuth } from '../../hooks/useAuth';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Alert, Paper, Button, Box, Divider } from '@mui/material';

const GroupList = ({ onSelectGroup, selectedGroupId, onGroupJoined }) => {
    const { user: currentUser } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joinError, setJoinError] = useState(null);
    const [joinLoading, setJoinLoading] = useState(null); // For individual join button

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllGroups();
            setGroups(data || []);
        } catch (err) {
            console.error("Error fetching groups:", err.response || err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch groups.');
            setGroups([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleJoinGroup = async (groupId, groupName) => {
        if (!currentUser || !currentUser.username) {
            setJoinError("Cannot join group: current user or username not found.");
            return;
        }
        setJoinLoading(groupId); // Set loading for specific group
        setJoinError(null);
        try {
            await joinGroup(groupId, currentUser.username);
            // alert(`Successfully joined group: ${groupName}`);
            if (onGroupJoined) {
                onGroupJoined({id: groupId, name: groupName}); // Notify parent, possibly to auto-select
            }
            // Optionally, re-fetch groups or update the specific group's state if it indicates membership
            // For simplicity, we assume UI might just allow selecting it after "joining".
            // A more complex UI would show "Joined" status.
        } catch (err) {
            console.error(`Error joining group ${groupId}:`, err.response || err);
            setJoinError(err.response?.data?.message || err.message || `Failed to join group ${groupName}.`);
        } finally {
            setJoinLoading(null);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>;

    return (
        <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', height: '100%' /* Adjust as needed */ }}>
            <Box p={2}>
                <Typography variant="h6" gutterBottom>Available Groups</Typography>
            </Box>
            {joinError && <Alert severity="error" sx={{m:1}}>{joinError}</Alert>}
            {groups.length === 0 && !loading && <Typography sx={{p:2}}>No groups found. Create one!</Typography>}
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                {groups.map((group, index) => (
                    <React.Fragment key={group.groupId || `group-${index}`}>
                        <ListItem
                            disablePadding
                            secondaryAction={
                                // TODO: Ideally, check if user is already a member to disable/change button
                                // This would require GET /groups/{groupId}/members and checking against currentUser.id
                                <Button
                                    size="small"
                                    onClick={() => handleJoinGroup(group.groupId, group.groupName)}
                                    disabled={joinLoading === group.groupId}
                                >
                                    {joinLoading === group.groupId ? <CircularProgress size={16} /> : 'Join'}
                                </Button>
                            }
                        >
                            <ListItemButton
                                onClick={() => onSelectGroup(group)}
                                selected={selectedGroupId === group.groupId}
                            >
                                <ListItemText primary={group.groupName || 'Unnamed Group'} />
                            </ListItemButton>
                        </ListItem>
                        {index < groups.length -1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default GroupList;
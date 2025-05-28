// src/pages/GroupsPage.jsx
import React, { useState, useCallback } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import GroupList from '../components/Groups/GroupList';
import CreateGroupForm from '../components/Groups/CreateGroupForm';
import GroupChatWindow from '../components/Groups/GroupChatWindow';

const GroupsPage = () => {
    const { user, isLoading: authLoading } = useAuth();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupListKey, setGroupListKey] = useState(Date.now()); // To force re-fetch of group list

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
    };

    const handleGroupCreated = (newGroup) => {
        // Optionally, auto-select the newly created group
        // setSelectedGroup(newGroup);
        // Refresh the group list
        setGroupListKey(Date.now());
    };

    const handleGroupJoined = (joinedGroup) => {
        // Optionally, auto-select the group after joining
        setSelectedGroup(joinedGroup);
        // Could also refresh group list if join status needs to be reflected there
        // setGroupListKey(Date.now());
    };

    if (authLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 128px)">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Container sx={{py:3}}>
                <Alert severity="info">Please log in to use group messaging.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ height: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column', p:0, m:0 }}>
            <Typography variant="h4" component="h1" sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
                Group Messaging
            </Typography>
            <Grid container sx={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                <Grid item xs={12} sm={4} md={3} sx={{ borderRight: {sm: '1px solid #ddd'}, height: '100%', display:'flex', flexDirection:'column', p:1, gap: 1 }}>
                    <CreateGroupForm onGroupCreated={handleGroupCreated} />
                    <Paper sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                        <GroupList
                            key={groupListKey}
                            onSelectGroup={handleSelectGroup}
                            selectedGroupId={selectedGroup?.id}
                            onGroupJoined={handleGroupJoined}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={8} md={9} sx={{height: '100%', display:'flex', flexDirection:'column'}}>
                    {selectedGroup ? (
                        <GroupChatWindow group={selectedGroup} />
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{p:3}}>
                            <Typography variant="h6" color="textSecondary">
                                Select or join a group to start messaging.
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default GroupsPage;
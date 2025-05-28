// src/components/Groups/CreateGroupForm.jsx
import React, { useState } from 'react';
import { createGroup } from '../../api/groupService';
import { TextField, Button, Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';

const CreateGroupForm = ({ onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!groupName.trim()) {
            setError("Group name cannot be empty.");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const newGroup = await createGroup(groupName.trim());
            setSuccess(`Group "${newGroup.groupName}" created successfully !`);
            setGroupName('');
            if (onGroupCreated) {
                onGroupCreated(newGroup); // Pass the new group data back
            }
        } catch (err) {
            console.error("Error creating group:", err.response || err);
            setError(err.response?.data?.message || err.message || 'Failed to create group.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Create a New Group</Typography>
            {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
            {success && <Alert severity="success" sx={{mb:2}}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    label="Group Name"
                    fullWidth
                    variant="outlined"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    disabled={loading}
                    sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create Group'}
                </Button>
            </Box>
        </Paper>
    );
};

export default CreateGroupForm;
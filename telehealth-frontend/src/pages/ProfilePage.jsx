// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateMyProfile } from '../api/userService';
import { Container, Typography, TextField, Button, Box, CircularProgress, Alert, Paper, Grid } from '@mui/material';

const ProfilePage = () => {
    const { user, isLoading: authLoading, role: userRole, loadUser } = useAuth(); // loadUser to refresh context
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        specialization: '',
        licenseNumber: '',
        experience: '',
    });
    const [editing, setEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Populate form when user data is available or changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                specialization: user.specialization || '',
                licenseNumber: user.licenseNumber || '',
                experience: user.experience === null || user.experience === undefined ? '' : String(user.experience),
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        const payload = {
            name: profileData.name,
            email: profileData.email,
        };

        if (userRole === 'ROLE_PROVIDER') {
            payload.specialization = profileData.specialization;
            payload.licenseNumber = profileData.licenseNumber;
            if (profileData.experience !== '' && !isNaN(parseInt(profileData.experience, 10))) {
                payload.experience = parseInt(profileData.experience, 10);
            } else if (profileData.experience === '') {
                payload.experience = null; // Send null if cleared
            }
        }

        try {
            await updateMyProfile(payload);
            await loadUser(localStorage.getItem('authToken')); // Refresh user data in context
            setSuccess('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading && !user) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 128px)">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Container sx={{py:3}}><Alert severity="warning">Please log in to view your profile.</Alert></Container>;
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="md">
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
                <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 3 }}>
                    My Profile
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Username"
                                value={user?.username || ''}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Role"
                                value={userRole || ''}
                                fullWidth
                                margin="normal"
                                InputProps={{ readOnly: true }}
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={12} sm={editing ? 6 : 12}>
                            <TextField
                                label="Full Name"
                                name="name"
                                value={profileData.name}
                                fullWidth
                                margin="normal"
                                onChange={handleChange}
                                InputProps={{ readOnly: !editing }}
                                required={editing}
                                variant={editing ? "outlined" : "filled"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={editing ? 6 : 12}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={profileData.email}
                                fullWidth
                                margin="normal"
                                onChange={handleChange}
                                InputProps={{ readOnly: !editing }}
                                required={editing}
                                variant={editing ? "outlined" : "filled"}
                            />
                        </Grid>

                        {userRole === 'ROLE_PROVIDER' && (
                            <>
                                <Grid item xs={12} sm={editing ? 6 : 12}>
                                    <TextField
                                        label="Specialization"
                                        name="specialization"
                                        value={profileData.specialization}
                                        fullWidth
                                        margin="normal"
                                        onChange={handleChange}
                                        InputProps={{ readOnly: !editing }}
                                        required={editing}
                                        variant={editing ? "outlined" : "filled"}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={editing ? 6 : 12}>
                                    <TextField
                                        label="License Number"
                                        name="licenseNumber"
                                        value={profileData.licenseNumber}
                                        fullWidth
                                        margin="normal"
                                        onChange={handleChange}
                                        InputProps={{ readOnly: !editing }}
                                        required={editing}
                                        variant={editing ? "outlined" : "filled"}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={editing ? 6 : 12}>
                                    <TextField
                                        label="Years of Experience"
                                        name="experience"
                                        type="number"
                                        value={profileData.experience}
                                        fullWidth
                                        margin="normal"
                                        onChange={handleChange}
                                        InputProps={{ readOnly: !editing }}
                                        variant={editing ? "outlined" : "filled"}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            {editing ? (
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                        {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                                    </Button>
                                    <Button variant="outlined" onClick={() => { setEditing(false); setError(null); setSuccess(null); /* Reset form to original user data */ if(user) setProfileData({name: user.name || '', email: user.email || '', specialization: user.specialization || '', licenseNumber: user.licenseNumber || '', experience: user.experience === null || user.experience === undefined ? '' : String(user.experience)});}} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                </Box>
                            ) : (
                                <Button variant="contained" onClick={() => setEditing(true)}>
                                    Edit Profile
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage;
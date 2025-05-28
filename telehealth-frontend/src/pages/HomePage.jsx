// src/pages/HomePage.jsx
import React from 'react';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // To customize view for logged-in users

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    Welcome to Your Telehealth Platform
                </Typography>
                <Typography variant="h6" color="textSecondary" paragraph>
                    Access healthcare services conveniently from anywhere.
                </Typography>

                {isAuthenticated ? (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Hello, {user?.name || user?.username}!
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Explore your dashboard, manage appointments, or connect with healthcare providers.
                        </Typography>
                        <Button component={RouterLink} to="/profile" variant="contained" color="primary" sx={{ m: 1 }}>
                            My Profile
                        </Button>
                        <Button component={RouterLink} to="/appointments" variant="outlined" color="primary" sx={{ m: 1 }}>
                            My Appointments
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="body1" paragraph>
                            Connect with qualified doctors, book appointments, and manage your health journey online.
                        </Typography>
                        <Button component={RouterLink} to="/providers" variant="contained" color="primary" sx={{ m: 1 }}>
                            Find a Provider
                        </Button>
                        <Button component={RouterLink} to="/login" variant="outlined" color="secondary" sx={{ m: 1 }}>
                            Login
                        </Button>
                        <Button component={RouterLink} to="/signup" variant="outlined" color="secondary" sx={{ m: 1 }}>
                            Sign Up
                        </Button>
                    </Box>
                )}

                <Box sx={{ mt: 5, p: 2, borderTop: '1px solid #eee' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Our Services Include:
                    </Typography>
                    <Typography component="ul" sx={{listStyle: 'none', p:0}}>
                        <li>Virtual Consultations</li>
                        <li>Appointment Booking</li>
                        <li>Secure Messaging</li>
                        <li>Access to Health Records (Future)</li>
                    </Typography>
                </Box>

            </Paper>
        </Container>
    );
};
export default HomePage;
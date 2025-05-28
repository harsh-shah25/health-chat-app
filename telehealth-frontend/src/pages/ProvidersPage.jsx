// src/pages/ProvidersPage.jsx
import React, { useEffect, useState } from 'react';
import { getAllProviders } from '../api/userService';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Alert, Box, Chip, Avatar } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // For potential "View Profile" or "Book" buttons

const ProvidersPage = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllProviders();
                setProviders(data || []); // Ensure providers is always an array
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch providers.');
                setProviders([]); // Set to empty array on error
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 128px)">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Container sx={{py:3}}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container sx={{ py: 3 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 3 }}>
                Healthcare Providers
            </Typography>
            {providers.length === 0 ? (
                <Typography>No providers found at the moment. Please check back later.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {providers.map((provider) => (
                        <Grid item key={provider.id || provider.username} xs={12} sm={6} md={4}>
                            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>{provider.name ? provider.name[0] : 'P'}</Avatar>
                                        <Typography variant="h6" component="div">
                                            {provider.name || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        @{provider.username}
                                    </Typography>
                                    {provider.specialization && (
                                        <Chip label={provider.specialization} color="primary" variant="outlined" size="small" sx={{my:1}}/>
                                    )}
                                    <Typography variant="body2" color="textSecondary" sx={{mt:1}}>
                                        Email: {provider.email}
                                    </Typography>
                                    {provider.experience !== undefined && provider.experience !== null && (
                                        <Typography variant="body2" color="textSecondary">
                                            Experience: {provider.experience} years
                                        </Typography>
                                    )}
                                                                    </CardContent>
                                <CardActions>
                                                                                                                                                                                                                    </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default ProvidersPage;
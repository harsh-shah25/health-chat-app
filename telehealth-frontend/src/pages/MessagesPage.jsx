// src/pages/MessagesPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import UserListForChat from '../components/Messages/UserListForChat'; // For Patients
import PatientContactsFromBookings from '../components/Messages/PatientContactsFromBookings'; // For Doctors
import ChatWindow from '../components/Messages/ChatWindow';

const MessagesPage = () => {
    const { user, role, isLoading: authLoading } = useAuth();
    const [selectedChatPartner, setSelectedChatPartner] = useState(null); // Will hold the selected user/patient object

    const handleSelectChatPartner = (partner) => {
        // Partner object should at least have { id, name (or username) }
        setSelectedChatPartner(partner);
    };

    useEffect(() => {
        if (!user) {
            setSelectedChatPartner(null);
        }
    }, [user]);


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
                <Alert severity="info">Please log in to use the messaging service.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ height: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column', p:0, m:0}}>
            <Typography variant="h4" component="h1" sx={{p:2, borderBottom: '1px solid #ddd'}}>
                Messages
            </Typography>
            <Grid container sx={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                <Grid item xs={12} sm={4} md={3} sx={{ borderRight: {sm: '1px solid #ddd'}, height: '100%', display:'flex', flexDirection:'column' }}>
                    {role === 'ROLE_PROVIDER' ? (
                        <PatientContactsFromBookings
                            onSelectPatient={handleSelectChatPartner}
                            selectedPatientId={selectedChatPartner?.id}
                        />
                    ) : ( // Assuming ROLE_PATIENT or other non-provider roles
                        <UserListForChat
                            onSelectUser={handleSelectChatPartner}
                            selectedUserId={selectedChatPartner?.id}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={8} md={9} sx={{height: '100%', display:'flex', flexDirection:'column'}}>
                    {selectedChatPartner ? (
                        // ChatWindow expects 'otherUser' prop with at least { id, name/username }
                        <ChatWindow otherUser={selectedChatPartner} />
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%" sx={{p:3}}>
                            <Typography variant="h6" color="textSecondary">
                                {role === 'ROLE_PROVIDER'
                                    ? "Select a patient from your bookings to start a conversation."
                                    : "Select a user from the list to start a conversation."
                                }
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default MessagesPage;
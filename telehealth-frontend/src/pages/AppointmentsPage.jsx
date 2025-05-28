// src/pages/AppointmentsPage.jsx
import React, { useState } from 'react';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

// Import Appointment sub-components
import DoctorList from '../components/Appointments/DoctorList';
import SlotViewerAndBooker from '../components/Appointments/SlotViewerAndBooker';
import MyBookings from '../components/Appointments/MyBookings';
import SlotCreator from '../components/Appointments/SlotCreator';
import ProviderScheduleView from '../components/Appointments/ProviderScheduleView';

const AppointmentsPage = () => {
    const { user, role, isLoading: authLoading } = useAuth();
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const handleDoctorSelect = (doctor) => {
        setSelectedDoctor(doctor);
    };

    // Callback to refresh provider's schedule after new slot creation
    // This is a bit of a trick: changing a key forces a component to remount and re-fetch.
    const [scheduleViewKey, setScheduleViewKey] = useState(0);
    const handleSlotCreated = () => {
        setScheduleViewKey(prevKey => prevKey + 1);
    };


    if (authLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 128px)">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container sx={{ py: 3 }}>
            <Paper sx={{ p: {xs: 2, sm: 3} }}>
                <Typography variant="h4" gutterBottom component="h1">
                    Appointments
                </Typography>

                {!user && <Typography>Please log in to manage appointments.</Typography>}

                {user && role === 'ROLE_PATIENT' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Book an Appointment</Typography>
                        <DoctorList onDoctorSelect={handleDoctorSelect} />
                        {selectedDoctor && <SlotViewerAndBooker doctor={selectedDoctor} />}
                        <MyBookings />
                    </Box>
                )}

                {user && role === 'ROLE_PROVIDER' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>Manage Your Schedule</Typography>
                        <ProviderScheduleView key={scheduleViewKey} />                         <SlotCreator onSlotCreated={handleSlotCreated} />
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default AppointmentsPage;
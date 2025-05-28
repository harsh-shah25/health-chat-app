// src/components/Appointments/SlotCreator.jsx
import React, { useState } from 'react';
import { createAppointmentSlot } from '../../api/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import { TextField, Button, Typography, CircularProgress, Alert, Paper, Box, Grid } from '@mui/material';
// For real date/time pickers, you'd use @mui/x-date-pickers
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SlotCreator = ({ onSlotCreated }) => {
    const { user } = useAuth(); // user object should contain the id which we'll use as providerId

    // slotTime will be the start time of the slot.
    // The API doesn't specify duration, so we assume the backend handles it or it's a fixed duration.
    const [slotTime, setSlotTime] = useState(''); // Should be ISO string format e.g., YYYY-MM-DDTHH:mm

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user || !user.id) { // Assuming user.id from AuthContext is the providerId
            setError("User (Provider) not identified. Cannot create slot.");
            return;
        }
        if (!slotTime) {
            setError("Slot time is required.");
            return;
        }

        // Optional: Add validation for slotTime format or if it's in the past, if needed.

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const slotDetails = {
                providerId: user.id, // Using the logged-in user's ID as the providerId
                slotTime: new Date(slotTime).toISOString(), // Ensure it's in ISO format
                available: true, // Default to true when creating a new slot
            };
            console.log('Submitting Slot Details to Backend:', slotDetails); // For debugging

            await createAppointmentSlot(slotDetails);
            setSuccess('Appointment slot created successfully!');
            setSlotTime(''); // Reset form field
            if (onSlotCreated) onSlotCreated(); // Callback to refresh list if needed
        } catch (err) {
            // Log the full error for more details, especially err.response.data if available
            console.error("Error creating slot:", err.response || err);
            setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create slot.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Create New Appointment Slot</Typography>
            {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
            {success && <Alert severity="success" sx={{mb:2}}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="caption" display="block" gutterBottom>
                    Select the date and start time for the new slot.
                </Typography>
                                                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>                         <TextField
                            label="Slot Date and Time"
                            type="datetime-local" // Provides basic browser-native picker
                            value={slotTime}
                            onChange={(e) => setSlotTime(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                            disabled={loading}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create Slot'}
                </Button>
            </Box>
                                                        </Paper>
    );
};

export default SlotCreator;
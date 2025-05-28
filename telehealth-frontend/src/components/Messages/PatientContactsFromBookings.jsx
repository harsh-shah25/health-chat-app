// src/components/Messages/PatientContactsFromBookings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getDoctorBookings } from '../../api/appointmentService';
import { getUserProfileById } from '../../api/userService'; // <--- IMPORT NEW SERVICE
import { useAuth } from '../../hooks/useAuth';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Alert, Paper, Box, Avatar, ListItemAvatar } from '@mui/material';

const PatientContactsFromBookings = ({ onSelectPatient, selectedPatientId }) => {
    const { user: currentDoctor } = useAuth();
    const [contacts, setContacts] = useState([]); // Will store full UserProfile objects for patients
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPatientContacts = useCallback(async () => {
        if (!currentDoctor || !currentDoctor.id) {
            setContacts([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const bookings = await getDoctorBookings(currentDoctor.id);
            console.log("Doctor's Bookings received:", bookings);

            if (Array.isArray(bookings) && bookings.length > 0) {
                // Get unique patient IDs from bookings
                const uniquePatientIds = [...new Set(bookings.map(b => b.patientId).filter(id => id != null))];

                console.log("Unique patient IDs from bookings:", uniquePatientIds);

                if (uniquePatientIds.length > 0) {
                    // Fetch profile for each unique patient ID
                    const patientProfilePromises = uniquePatientIds.map(id =>
                        getUserProfileById(id)
                            .then(profile => {
                                if (profile) {
                                    return profile; // Should be { id, name, username, email, role, ... }
                                } else {
                                    // Fallback if profile fetch fails for a specific user
                                    return { id, name: `Patient ID: ${id}`, username: `patient_${id}`, isFallback: true };
                                }
                            })
                    );

                    const resolvedPatientProfiles = await Promise.all(patientProfilePromises);
                    console.log("Resolved Patient Profiles:", resolvedPatientProfiles);
                    setContacts(resolvedPatientProfiles.filter(p => p != null)); // Filter out any nulls from failed fetches
                } else {
                    setContacts([]); // No unique patient IDs found
                }

            } else {
                setContacts([]); // No bookings found
            }
        } catch (err) {
            console.error("Error fetching patient contacts from bookings:", err.response || err);
            setError(err.response?.data?.message || err.message || 'Failed to load patient contacts.');
            setContacts([]);
        } finally {
            setLoading(false);
        }
    }, [currentDoctor]);

    useEffect(() => {
        fetchPatientContacts();
    }, [fetchPatientContacts]);

    if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 1 }}>{error}</Alert>;

    return (
        <Paper elevation={1} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box p={2}>
                <Typography variant="h6" gutterBottom>Your Patient Contacts</Typography>
                <Typography variant="caption" display="block" gutterBottom>
                    Users who have booked appointments with you.
                </Typography>
            </Box>
            {contacts.length === 0 && !loading && (
                <Typography sx={{p:2, textAlign: 'center'}}>
                    No patient contacts found from your bookings yet.
                </Typography>
            )}
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                {contacts.map((patientContact) => ( // patientContact is now a UserProfile DTO or a fallback object
                    <ListItem key={patientContact.id} disablePadding>
                        <ListItemButton
                            onClick={() => onSelectPatient(patientContact)} // Pass the full UserProfile object
                            selected={selectedPatientId === patientContact.id}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'secondary.dark' }}>
                                                                        {patientContact.name?.charAt(0)?.toUpperCase() || patientContact.username?.charAt(0)?.toUpperCase() || 'P'}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={patientContact.name || patientContact.username || `Patient ID: ${patientContact.id}`} // Display name or username
                                secondary={patientContact.email || (patientContact.isFallback ? '' : 'Email not available')} // Display email if available
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default PatientContactsFromBookings;
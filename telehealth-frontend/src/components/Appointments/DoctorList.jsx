// src/components/Appointments/DoctorList.jsx
import React, { useState, useEffect } from 'react';
import { getDoctors } from '../../api/appointmentService';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Alert, Paper, TextField, Box } from '@mui/material';

const DoctorList = ({ onDoctorSelect }) => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getDoctors();
                setDoctors(data || []);
                setFilteredDoctors(data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch doctors.');
                setDoctors([]);
                setFilteredDoctors([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        const results = doctors.filter(doctor =>
            (doctor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (doctor.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        setFilteredDoctors(results);
    }, [searchTerm, doctors]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Select a Doctor</Typography>
            <TextField
                label="Search Doctors (Name or Specialization)"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredDoctors.length === 0 && !loading && <Typography>No doctors found.</Typography>}
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {filteredDoctors.map((doctor) => (
                    <ListItem key={doctor.id || doctor.username} disablePadding>
                        <ListItemButton onClick={() => onDoctorSelect(doctor)}>
                            <ListItemText
                                primary={doctor.name || 'Unknown Doctor'}
                                secondary={doctor.specialization || 'No specialization listed'}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default DoctorList;
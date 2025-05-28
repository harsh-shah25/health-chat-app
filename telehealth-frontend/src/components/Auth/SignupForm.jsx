// src/components/Auth/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup as apiSignup } from '../../api/authService'; // Direct API call
import {
    TextField, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress
} from '@mui/material';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'ROLE_PATIENT',
        specialization: '',
        licenseNumber: '',
        experience: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setFormData({
            ...formData,
            role: newRole,
            specialization: newRole === 'ROLE_PROVIDER' ? formData.specialization : '',
            licenseNumber: newRole === 'ROLE_PROVIDER' ? formData.licenseNumber : '',
            experience: newRole === 'ROLE_PROVIDER' ? formData.experience : '',
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        const payload = {
            username: formData.username,
            password: formData.password,
            name: formData.name,
            email: formData.email,
            role: formData.role,
        };

        if (formData.role === 'ROLE_PROVIDER') {
            payload.specialization = String(formData.specialization);
            payload.licenseNumber = String(formData.licenseNumber);
            if (formData.experience && !isNaN(parseInt(formData.experience, 10))) {
                payload.experience = String(parseInt(formData.experience, 10));
            } else if (formData.role === 'ROLE_PROVIDER' && formData.experience) {
                // Handle case where experience is provided but not a valid number for provider
                // This basic validation might be enhanced.
            }
        }

        // Basic validation
        if (!payload.username || !payload.password || !payload.name || !payload.email) {
            setError("Please fill in all required fields: Username, Password, Name, Email.");
            setIsLoading(false);
            return;
        }
        if (formData.role === 'ROLE_PROVIDER' && (!payload.specialization || !payload.licenseNumber)) {
            setError("Provider role requires Specialization and License Number.");
            setIsLoading(false);
            return;
        }

        try {
            await apiSignup(payload);
            setSuccess('Signup successful! You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Typography component="h1" variant="h5" align="center">
                Sign Up
            </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2, mb:1 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ width: '100%', mt: 2, mb:1 }}>{success}</Alert>}

            <TextField margin="normal" required fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} disabled={isLoading} autoComplete="username"/>
            <TextField margin="normal" required fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} disabled={isLoading} autoComplete="new-password"/>
            <TextField margin="normal" required fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} autoComplete="name"/>
            <TextField margin="normal" required fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} autoComplete="email"/>

            <FormControl fullWidth margin="normal" required disabled={isLoading}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                    labelId="role-select-label"
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleRoleChange}
                >
                    <MenuItem value="ROLE_PATIENT">Patient</MenuItem>
                    <MenuItem value="ROLE_PROVIDER">Healthcare Provider</MenuItem>
                </Select>
            </FormControl>

            {formData.role === 'ROLE_PROVIDER' && (
                <>
                    <TextField margin="normal" required fullWidth label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} disabled={isLoading}/>
                    <TextField margin="normal" required fullWidth label="License Number" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} disabled={isLoading}/>
                    <TextField margin="normal" fullWidth label="Years of Experience (Optional)" name="experience" type="number" value={formData.experience} onChange={handleChange} disabled={isLoading}/>
                </>
            )}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
        </Box>
    );
};

export default SignupForm;
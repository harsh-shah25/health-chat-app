// src/pages/SignupPage.jsx
import React from 'react';
import { Container, Box } from '@mui/material';
import SignupForm from '../components/Auth/SignupForm'; // Using the separate component

const SignupPage = () => {
    return (
        <Container component="main" maxWidth="sm">             <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <SignupForm />
            </Box>
        </Container>
    );
};

export default SignupPage;
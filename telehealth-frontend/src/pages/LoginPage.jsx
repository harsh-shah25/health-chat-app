// src/pages/LoginPage.jsx
import React from 'react';
import { Container, Box } from '@mui/material';
import LoginForm from '../components/Auth/LoginForm'; // Using the separate component

const LoginPage = () => {
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <LoginForm />
            </Box>
        </Container>
    );
};

export default LoginPage;
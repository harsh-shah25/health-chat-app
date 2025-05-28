// src/pages/NotFoundPage.jsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Example icon

const NotFoundPage = () => (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 5 }}>
        <Box sx={{ mb: 3 }}>
            <ReportProblemIcon sx={{ fontSize: 80, color: 'warning.main' }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom>
            404 - Page Not Found
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" color="primary" sx={{ mt: 2 }}>
            Go to Homepage
        </Button>
    </Container>
);

export default NotFoundPage;
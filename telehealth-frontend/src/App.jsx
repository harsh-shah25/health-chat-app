import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box, Toolbar } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ProtectedRoute from './components/Common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProvidersPage from './pages/ProvidersPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import MessagesPage from './pages/MessagesPage';
import GroupsPage from './pages/GroupsPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

const drawerWidth = 240;

function App() {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <AuthProvider>
            <Router>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <Navbar onDrawerToggle={handleDrawerToggle} />
                    <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            width: { sm: `calc(100% - ${drawerWidth}px)` },
                        }}
                    >
                        <Toolbar />
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/providers" element={<ProvidersPage />} />
                            <Route path="/" element={<HomePage />} />

                            <Route element={<ProtectedRoute />}>
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/appointments" element={<AppointmentsPage />} />
                                <Route path="/messages" element={<MessagesPage />} />
                                <Route path="/groups" element={<GroupsPage />} />
                                <Route path="/notifications" element={<NotificationsPage />} />

                            </Route>

                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </AuthProvider>
    );
}

export default App;
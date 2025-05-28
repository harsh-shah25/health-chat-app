// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
// import PeopleIcon from '@mui/icons-material/People'; // Not used directly in provided links
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
    const { isAuthenticated, role } = useAuth();
    const location = useLocation();

    const commonLinks = [
        { text: 'Home', icon: <HomeIcon />, path: '/' },

    ];

    let authenticatedUserLinks = [
        { text: 'Healthcare Providers', icon: <MedicalServicesIcon />, path: '/providers' },
        { text: 'My Profile', icon: <AccountCircleIcon />, path: '/profile' },
        { text: 'Appointments', icon: <EventAvailableIcon />, path: '/appointments' },
        { text: 'Messages', icon: <ChatIcon />, path: '/messages' },
        { text: 'Groups', icon: <GroupIcon />, path: '/groups' },
        // { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' }, // Example, can be added
    ];

    // Example: Role-specific links
    // if (role === 'ROLE_PROVIDER') {
    //   authenticatedUserLinks.push({ text: 'My Slots', icon: <EventNoteIcon />, path: '/my-slots' });
    // }


    const drawerContent = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {commonLinks.map((item) => (
                    <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{color: 'inherit', textDecoration: 'none'}}>
                        <ListItemButton selected={location.pathname === item.path}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {isAuthenticated && (
                <>
                    <Divider />
                    <List>
                        {authenticatedUserLinks.map((item) => (
                            <ListItem key={item.text} disablePadding component={RouterLink} to={item.path} sx={{color: 'inherit', textDecoration: 'none'}}>
                                <ListItemButton selected={location.pathname === item.path}>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </>
            )}
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
        >
                        <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>
                        <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
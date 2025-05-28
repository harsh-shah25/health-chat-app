// src/components/Appointments/ProviderScheduleView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getDoctorBookings, getAvailableSlots, cancelBooking } from '../../api/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import { List, ListItem, ListItemText, Typography, CircularProgress, Alert, Paper, Divider, Box, Button, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { formatDateSafe } from '../../utils/dateUtils'; // Ensure this utility is imported
// Optional: import { addMinutes } from 'date-fns';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`schedule-tabpanel-${index}`}
            aria-labelledby={`schedule-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 2 }}>                     {children}
                </Box>
            )}
        </div>
    );
}

const ProviderScheduleView = () => {
    const { user } = useAuth(); // This is the logged-in provider
    const [bookings, setBookings] = useState([]); // For "Booked Appointments" tab
    const [myOpenSlots, setMyOpenSlots] = useState([]); // For "My Available Slots" tab
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    const fetchProviderData = useCallback(async () => {
        if (!user || !user.id) return;

        setError(null); // Clear previous errors
        setActionError(null); // Clear previous action errors
        setActionSuccess(null); // Clear previous action successes

        // Fetch bookings
        setLoadingBookings(true);
        try {
            const bookingsData = await getDoctorBookings(user.id);
            console.log('Fetched Doctor Bookings Data:', JSON.stringify(bookingsData, null, 2));
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch (err) {
            console.error("Error fetching doctor bookings:", err.response || err);
            setError(prev => prev ? `${prev}\nFailed to fetch bookings.` : 'Failed to fetch bookings.');
            setBookings([]);
        } finally {
            setLoadingBookings(false);
        }

        // Fetch provider's own available slots
        setLoadingSlots(true);
        try {
            const allProviderSlotsData = await getAvailableSlots(user.id);
            console.log('Fetched Provider Available Slots Data:', JSON.stringify(allProviderSlotsData, null, 2));
            // Filter for slots that are marked as available (or !isBooked based on your slot object structure)
            setMyOpenSlots(allProviderSlotsData ? allProviderSlotsData.filter(slot => slot.available) : []);
        } catch (err) {
            console.error("Error fetching available slots:", err.response || err);
            setError(prev => prev ? `${prev}\nFailed to fetch available slots.` : 'Failed to fetch available slots.');
            setMyOpenSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.id) {
            fetchProviderData();
        }
    }, [fetchProviderData, user]); // Add user to dependency array

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        setLoadingBookings(true);
        setActionError(null);
        setActionSuccess(null);
        try {
            await cancelBooking(bookingToCancel.id); // bookingToCancel.id is the Booking ID
            setActionSuccess('Booking cancelled successfully.');
            fetchProviderData(); // Refresh all data
        } catch (err) {
            console.error("Error cancelling booking:", err.response || err);
            setActionError(err.response?.data?.message || err.message || 'Failed to cancel booking.');
        } finally {
            setLoadingBookings(false);
            setConfirmationOpen(false);
            setBookingToCancel(null);
        }
    };

    const openConfirmationDialog = (booking) => {
        setBookingToCancel(booking);
        setConfirmationOpen(true);
    };

    const handleCloseConfirmation = () => {
        setConfirmationOpen(false);
        setBookingToCancel(null);
    };

    // Placeholder for patient name - ideally backend provides this
    const getPatientDisplayName = (booking) => {
        return booking.patientName || booking.patientEmail || `Patient ID: ${booking.patientId}`;
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>My Schedule</Typography>
            {error && <Alert severity="error" sx={{mb:1}}>{error.split('\n').map((item, key) => <div key={key}>{item}</div>)}</Alert>}
            {actionError && <Alert severity="error" sx={{mb:1}}>{actionError}</Alert>}
            {actionSuccess && <Alert severity="success" sx={{mb:1}}>{actionSuccess}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="provider schedule tabs">
                    <Tab label="Booked Appointments" id="schedule-tab-0" aria-controls="schedule-tabpanel-0"/>
                    <Tab label="My Open Slots" id="schedule-tab-1" aria-controls="schedule-tabpanel-1"/>
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>                 {loadingBookings ? <CircularProgress sx={{display: 'block', margin: '20px auto'}} /> : (
                    bookings.length === 0 ? <Typography>No appointments booked with you yet.</Typography> : (
                        <List>
                            {bookings.map((booking, index) => {
                                // Assuming no explicit endTime for booking, similar to patient's view
                                // If your backend can provide the original slot's endTime, that would be better.
                                const DEFAULT_SLOT_DURATION_MINUTES = 30; // Example
                                let endTimeDisplay = '(Duration not specified)';
                                // Example of calculating endTime if you have a fixed duration and want to show it:
                                // if (booking.slot && booking.slot.slotTime) {
                                //   const startTimeObj = new Date(booking.slot.slotTime);
                                //   if (!isNaN(startTimeObj.getTime())) {
                                //      const endTimeObj = addMinutes(startTimeObj, DEFAULT_SLOT_DURATION_MINUTES);
                                //      endTimeDisplay = `To: ${format(endTimeObj, "p")}`;
                                //   }
                                // }
                                // Or, if your booking.slot object might have an 'endTime' field:
                                // endTimeDisplay = booking.slot.endTime ? `To: ${formatDateSafe(booking.slot.endTime, "p")}` : '(Duration not specified)';


                                return (
                                    <React.Fragment key={booking.id || `booking-${index}`}>
                                        <ListItem
                                            secondaryAction={
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => openConfirmationDialog(booking)}
                                                    disabled={loadingBookings}
                                                >
                                                    Cancel Booking
                                                </Button>
                                            }
                                        >
                                            <ListItemText
                                                primary={`With: ${getPatientDisplayName(booking)}`}
                                                secondary={
                                                    `On: ${formatDateSafe(booking.slot?.slotTime, "PPP")} ` +
                                                    `At: ${formatDateSafe(booking.slot?.slotTime, "p")} ` +
                                                    `${endTimeDisplay}` + // Display calculated/known end time or duration
                                                    ` (Booked on: ${formatDateSafe(booking.bookedAt, "MMM d, yyyy")})`
                                                }
                                            />
                                        </ListItem>
                                        {index < bookings.length - 1 && <Divider />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>                 {loadingSlots ? <CircularProgress sx={{display: 'block', margin: '20px auto'}} /> : (
                    myOpenSlots.length === 0 ? <Typography>You have no open slots. Create some using the form below the schedule.</Typography> : (
                        <List>
                            {myOpenSlots.map((slot, index) => ( // 'slot' here is from getAvailableSlots: { id, providerId, slotTime, available }
                                <React.Fragment key={slot.id || `slot-${index}`}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                `${formatDateSafe(slot.slotTime, "PPP 'at' p")}`
                                                // If your 'getAvailableSlots' for provider returns an endTime for each slot:
                                                // + `${slot.endTime ? ` - ${formatDateSafe(slot.endTime, "p")}` : ' (Duration not set)'}`
                                            }
                                            secondary={slot.available ? "Available" : "Booked/Unavailable"}
                                        />
                                                                                                                    </ListItem>
                                    {index < myOpenSlots.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )
                )}
            </TabPanel>

            <Dialog open={confirmationOpen} onClose={handleCloseConfirmation}>
                <DialogTitle>Confirm Cancellation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel the appointment
                        {bookingToCancel ?
                            ` with ${getPatientDisplayName(bookingToCancel)} on ${formatDateSafe(bookingToCancel.slot?.slotTime, "PPP 'at' p")}`
                            : ''
                        }?
                        The patient should be notified.
                    </DialogContentText>
                    {actionError && <Alert severity="error" sx={{mt:1}}>{actionError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmation} disabled={loadingBookings}>Keep Appointment</Button>
                    <Button onClick={handleCancelBooking} color="error" variant="contained" disabled={loadingBookings}>
                        {loadingBookings ? <CircularProgress size={20}/> : "Yes, Cancel This Booking"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default ProviderScheduleView;
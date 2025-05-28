// src/components/Appointments/MyBookings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPatientBookings, cancelBooking } from '../../api/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import { List, ListItem, ListItemText, Typography, CircularProgress, Alert, Button, Paper, Divider, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
// Assuming you have created this utility file as discussed
import { formatDateSafe } from '../../utils/dateUtils';
// Optional: for adding duration if you want to calculate endTime
// import { addMinutes } from 'date-fns';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    const fetchBookings = useCallback(async () => {
        if (!user || !user.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getPatientBookings(user.id);
            console.log('Fetched Patient Bookings Data from API:', JSON.stringify(data, null, 2));
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching bookings:", err.response || err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch your bookings.');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.id) { // Fetch only if user is loaded
            fetchBookings();
        }
    }, [fetchBookings, user]); // Add user to dependency array

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        setLoading(true);
        setActionError(null);
        setActionSuccess(null);
        try {
            await cancelBooking(bookingToCancel.id); // bookingToCancel.id is the Booking ID
            setActionSuccess('Booking cancelled successfully.');
            fetchBookings(); // Refresh the list
        } catch (err) {
            console.error("Error cancelling booking:", err.response || err);
            setActionError(err.response?.data?.message || err.message || 'Failed to cancel booking.');
        } finally {
            setLoading(false);
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

    // For displaying doctor's name - you might need to fetch provider details based on booking.slot.providerId
    // or have the backend include doctorName in the booking response.
    // For now, we'll show providerId if doctorName isn't directly available.
    const getDoctorDisplayName = (booking) => {
        // Ideally, your booking API response would include doctor's name
        // If not, you might show "Provider ID: X" or make another API call (less ideal for lists)
        return booking.doctorName || `Provider ID: ${booking.slot?.providerId || 'N/A'}`;
    }

    if (loading && bookings.length === 0) return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>My Booked Appointments</Typography>
            {actionError && <Alert severity="error" sx={{mb:2}}>{actionError}</Alert>}
            {actionSuccess && <Alert severity="success" sx={{mb:2}}>{actionSuccess}</Alert>}

            {bookings.length === 0 && !loading && <Typography>You have no appointments booked.</Typography>}
            <List>
                {bookings.map((booking, index) => {
                    // Define a default slot duration if not provided by backend (e.g., 30 minutes)
                    const DEFAULT_SLOT_DURATION_MINUTES = 30;
                    let endTimeDisplay = '(Duration not specified)';
                    if (booking.slot && booking.slot.slotTime) {
                        // If you want to calculate and display an endTime assuming a fixed duration:
                        // const startTimeObj = new Date(booking.slot.slotTime);
                        // if (!isNaN(startTimeObj.getTime())) {
                        //   const endTimeObj = addMinutes(startTimeObj, DEFAULT_SLOT_DURATION_MINUTES);
                        //   endTimeDisplay = `To: ${format(endTimeObj, "p")}`;
                        // }
                        // For now, let's just indicate that endTime is not directly available.
                        // Or if your backend starts returning slot.endTime:
                        // endTimeDisplay = booking.slot.endTime ? `To: ${formatDateSafe(booking.slot.endTime, "p")}` : '(Duration not specified)';
                    }

                    return (
                        <React.Fragment key={booking.id || `booking-${index}`}>
                            <ListItem
                                secondaryAction={
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => openConfirmationDialog(booking)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={`Appointment with ${getDoctorDisplayName(booking)}`}
                                    secondary={
                                        `On: ${formatDateSafe(booking.slot?.slotTime, "PPP")} ` +
                                        `At: ${formatDateSafe(booking.slot?.slotTime, "p")} ` +
                                        // Displaying end time or duration indication:
                                        `${endTimeDisplay}`
                                        // If you want to show when it was booked:
                                        // ` (Booked: ${formatDateSafe(booking.bookedAt, "Pp")})`
                                    }
                                />
                            </ListItem>
                            {index < bookings.length - 1 && <Divider />}
                        </React.Fragment>
                    );
                })}
            </List>

            <Dialog open={confirmationOpen} onClose={handleCloseConfirmation}>
                <DialogTitle>Confirm Cancellation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel your appointment
                        {bookingToCancel ?
                            ` with ${getDoctorDisplayName(bookingToCancel)} on ${formatDateSafe(bookingToCancel.slot?.slotTime, "PPP 'at' p")}`
                            : ''
                        }?
                    </DialogContentText>
                    {actionError && <Alert severity="error" sx={{mt:1}}>{actionError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmation} disabled={loading}>Keep Appointment</Button>
                    <Button onClick={handleCancelBooking} color="error" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20}/> : "Yes, Cancel"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default MyBookings;
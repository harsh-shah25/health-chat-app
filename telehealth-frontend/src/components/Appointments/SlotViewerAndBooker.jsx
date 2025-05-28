// src/components/Appointments/SlotViewerAndBooker.jsx
import React, { useState, useEffect } from 'react';
import { getAvailableSlots, bookAppointment } from '../../api/appointmentService';
import { sendNotification } from '../../api/notificationService';
import { useAuth } from '../../hooks/useAuth';
import {
    List,
    ListItem,
    // ListItemButton, // Not used in the latest version of this specific component
    ListItemText,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Paper,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material'; // <<< ENSURE ALL USED COMPONENTS ARE HERE
import { formatDateSafe } from '../../utils/dateUtils'

const SlotViewerAndBooker = ({ doctor }) => {
    const { user } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false); // General loading for slots/booking
    const [sendingNotification, setSendingNotification] = useState(false); // Specific for notification
    const [error, setError] = useState(null);
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [notificationStatus, setNotificationStatus] = useState(''); // To show notification sending status
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);

    useEffect(() => {
        const doctorIdToFetch = doctor?.id || doctor?.providerId;
        if (doctor && doctorIdToFetch) {
            const fetchSlots = async () => {
                setLoading(true);
                setError(null);
                setBookingError(null);
                setBookingSuccess(null);
                setNotificationStatus('');
                try {
                    const data = await getAvailableSlots(doctorIdToFetch);
                    setSlots(Array.isArray(data) ? data : []);
                } catch (err) {
                    setError(err.response?.data?.message || err.message || `Failed to fetch slots for ${doctor.name}.`);
                    setSlots([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchSlots();
        } else {
            setSlots([]);
        }
    }, [doctor]);

    const handleBookSlot = async () => {
        if (!selectedSlot || !user || !user.id ) {
            setBookingError("User details or slot information is missing for booking.");
            setConfirmationOpen(false);
            return;
        }
        console.log("helooooooooooooooo")
        console.log(user)
        setLoading(true); // Indicates booking process is starting
        setBookingError(null);
        setBookingSuccess(null);
        setNotificationStatus('');

        try {
            const bookingDetails = {
                slotId: selectedSlot.id,
                patientId: user.id,
            };
            console.log("Booking details payload (to /book):", bookingDetails);

            // Step 1: Book the appointment
            const bookingApiResponse = await bookAppointment(bookingDetails);
            // Assuming bookingApiResponse contains some confirmation or the created booking object
            // If it throws an error, the catch block below will handle it.

            setBookingSuccess(`Appointment booked successfully for ${formatDateSafe(selectedSlot.slotTime, "PPP 'at' p")}!`);
            setConfirmationOpen(false); // Close confirmation dialog on successful booking

            // Step 2: Trigger Notification from Frontend
            if (user.email) { // Check if user email is available
                setSendingNotification(true);
                setNotificationStatus('Sending confirmation email...');
                try {
                    const notificationPayload = {
                        channel: "email",
                        recipient: user.email,
                        subject: `Appointment Confirmed: Dr. ${doctor?.name || 'Your Doctor'} on ${formatDateSafe(selectedSlot.slotTime, "MMM d")}`,
                        message: `Dear ${user.name || user.username || 'Patient'},\n\nYour appointment with Dr. ${doctor?.name || 'your doctor'} for ${formatDateSafe(selectedSlot.slotTime, "PPP 'at' p")} has been successfully booked.\n\nSlot ID: ${selectedSlot.id}\n\nThank you.`
                        // You might want to include a booking ID if returned by bookAppointment API:
                        // message: `... \nBooking ID: ${bookingApiResponse?.id || 'N/A'}\n...`
                    };
                    console.log("Sending notification payload:", notificationPayload);
                    await sendNotification(notificationPayload);
                    setNotificationStatus('Confirmation email sent successfully!');
                    console.log("Confirmation notification request sent.");
                } catch (notificationError) {
                    console.error("Failed to send confirmation notification:", notificationError.response || notificationError);
                    setNotificationStatus('Booking confirmed, but failed to send confirmation email. Please check your bookings section.');
                    // This is a non-critical error for the booking itself, so we just inform the user.
                } finally {
                    setSendingNotification(false);
                }
            } else {
                setNotificationStatus('Booking confirmed. No email on file for notification.');
            }

            // Refresh slot list
            const doctorIdToFetch = doctor?.id || doctor?.providerId;
            if (doctorIdToFetch) {
                const updatedSlotsData = await getAvailableSlots(doctorIdToFetch);
                setSlots(Array.isArray(updatedSlotsData) ? updatedSlotsData : []);
            } else {
                setSlots(prevSlots => prevSlots.filter(slot => slot.id !== selectedSlot.id));
            }
            setSelectedSlot(null);

        } catch (err) { // Catch errors from bookAppointment
            console.error("Error booking appointment:", err.response || err);
            setBookingError(err.response?.data?.message || err.message || 'Failed to book appointment.');
            // Keep confirmation dialog open if booking itself fails
        } finally {
            setLoading(false); // Booking process finished (success or fail)
            // setConfirmationOpen(false); // Moved success closing earlier
        }
    };

    const openConfirmationDialog = (slot) => {
        setSelectedSlot(slot);
        setBookingError(null); // Clear previous errors when opening dialog
        setBookingSuccess(null);
        setNotificationStatus('');
        setConfirmationOpen(true);
    };

    const handleCloseConfirmation = () => {
        setConfirmationOpen(false);
        setSelectedSlot(null);
    };

    if (!doctor) return null;

    return (
        <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Available Slots for Dr. {doctor.name || 'Selected Doctor'}</Typography>

                        {loading && slots.length === 0 && <CircularProgress sx={{display: 'block', margin: '20px auto'}} />}

                        {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}
            {bookingError && <Alert severity="error" sx={{mb:2}}>{bookingError}</Alert>}
            {bookingSuccess && <Alert severity="success" sx={{mb:2}}>{bookingSuccess}</Alert>}

                        {notificationStatus && !bookingError && ( // Only show if no booking error
                <Alert
                    severity={notificationStatus.startsWith('Failed') || notificationStatus.startsWith('Booking confirmed, but failed') ? 'warning' : 'info'}
                    sx={{mb:2}}
                >
                    {notificationStatus}
                </Alert>
            )}


            {slots.length === 0 && !loading && <Typography>No available slots for this doctor currently.</Typography>}
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {slots.map((slot) => (
                    <ListItem
                        key={slot.id}
                        disablePadding
                        secondaryAction={
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => openConfirmationDialog(slot)}
                                disabled={!slot.available || loading || sendingNotification}
                            >
                                Book
                            </Button>
                        }
                    >
                        <ListItemText
                            primary={`${formatDateSafe(slot.slotTime, "PPP 'at' p")}`}
                            secondary={slot.available ? "Available" : "Not Available / Booked"}
                        />
                    </ListItem>
                ))}
            </List>

            <Dialog open={confirmationOpen} onClose={handleCloseConfirmation}>
                <DialogTitle>Confirm Booking</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to book an appointment with Dr. {doctor?.name || 'Selected Doctor'} on
                        {selectedSlot ? ` ${formatDateSafe(selectedSlot.slotTime, "PPP 'at' p")}` : ''}?
                    </DialogContentText>
                                        {bookingError && <Alert severity="error" sx={{mt:1}}>{bookingError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmation} disabled={loading || sendingNotification}>Cancel</Button>
                    <Button
                        onClick={handleBookSlot}
                        color="primary"
                        variant="contained"
                        disabled={loading || sendingNotification}
                    >
                        {loading || sendingNotification ? <CircularProgress size={20}/> : "Confirm & Book"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SlotViewerAndBooker;
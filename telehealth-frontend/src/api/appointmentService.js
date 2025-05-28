// src/api/appointmentService.js
import api from './index';

// Get list of all doctors (might be same as providers or a subset)
export const getDoctors = async () => {
    const response = await api.get('/users/providers');
    return response.data;
};

// Create a new appointment slot (doctor side)
export const createAppointmentSlot = async (slotDetails) => {
    const response = await api.post('/appointments/slots', slotDetails);
    return response.data;
};

// List available slots for a doctor
export const getAvailableSlots = async (doctorId) => {
    console.log("inside avail")
    const response = await api.get('/appointments/slots', { params: { doctorId } });
    return response.data;
};

// Book an appointment slot (patient side)
export const bookAppointment = async (bookingDetails) => { // { slotId, patientId, patientEmail }
    const response = await api.post('/appointments/book', bookingDetails);
    return response.data;
};

// List bookings for a patient
export const getPatientBookings = async (patientId) => {
    const response = await api.get(`/appointments/bookings/patient/${patientId}`);
    return response.data;
};

// List bookings for a doctor
export const getDoctorBookings = async (doctorId) => {
    const response = await api.get(`/appointments/bookings/doctor/${doctorId}`);
    return response.data;
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
    const response = await api.delete(`/appointments/bookings/${bookingId}`);
    return response.data;
};
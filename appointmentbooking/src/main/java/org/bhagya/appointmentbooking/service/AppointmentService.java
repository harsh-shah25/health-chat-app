package org.bhagya.appointmentbooking.service;

import org.bhagya.appointmentbooking.model.*;
import org.bhagya.appointmentbooking.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentSlotRepository slotRepo;
    private final AppointmentBookingRepository bookingRepo;

    public AppointmentService(AppointmentSlotRepository slotRepo,
                              AppointmentBookingRepository bookingRepo) {
        this.slotRepo = slotRepo;
        this.bookingRepo = bookingRepo;
    }

    public AppointmentSlot createSlot(AppointmentSlot slot) {
        return slotRepo.save(slot);
    }

    public List<AppointmentSlot> listAvailableSlots(Long doctorId) {
        return slotRepo.findByProviderIdAndAvailableTrue(doctorId);
    }

    @Transactional
    public AppointmentBooking bookSlot(Long slotId, Long patientId) {
        AppointmentSlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (!slot.getAvailable()) {
            throw new IllegalStateException("Slot already booked");
        }

        slot.setAvailable(false);
        slotRepo.save(slot);

        AppointmentBooking booking = new AppointmentBooking();
        booking.setSlot(slot);
        booking.setPatientId(patientId);
        return bookingRepo.save(booking);
    }

    public List<AppointmentBooking> listBookings(Long patientId) {
        return bookingRepo.findByPatientId(patientId);
    }

    public List<AppointmentBooking> listDoctorBookings(Long doctorId) {
        List<AppointmentSlot> doctorSlots = slotRepo.findByProviderId(doctorId);
        return bookingRepo.findBySlotIn(doctorSlots);
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        AppointmentBooking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        AppointmentSlot slot = booking.getSlot();
        slot.setAvailable(true);
        slotRepo.save(slot);

        bookingRepo.delete(booking);
    }
}

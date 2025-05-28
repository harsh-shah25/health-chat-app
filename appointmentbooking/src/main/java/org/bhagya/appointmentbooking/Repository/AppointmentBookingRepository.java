package org.bhagya.appointmentbooking.Repository;

import org.bhagya.appointmentbooking.model.AppointmentBooking;
import org.bhagya.appointmentbooking.model.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentBookingRepository extends JpaRepository<AppointmentBooking, Long> {
    List<AppointmentBooking> findByPatientId(Long patientId);
    List<AppointmentBooking> findBySlotIn(List<AppointmentSlot> slots);
}

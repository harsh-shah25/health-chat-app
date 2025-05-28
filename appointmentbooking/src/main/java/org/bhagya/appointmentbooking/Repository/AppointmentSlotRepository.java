package org.bhagya.appointmentbooking.Repository;

import org.bhagya.appointmentbooking.model.AppointmentSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {
    List<AppointmentSlot> findByProviderIdAndAvailableTrue(Long providerId);
    List<AppointmentSlot> findByProviderId(Long providerId);
}

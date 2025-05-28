// src/main/java/com/bhagya/appointmentservice/model/AppointmentBooking.java
package org.bhagya.appointmentbooking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment_bookings")
public class AppointmentBooking {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "slot_id")
    private AppointmentSlot slot;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private LocalDateTime bookedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppointmentSlot getSlot() { return slot; }
    public void setSlot(AppointmentSlot slot) { this.slot = slot; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
}

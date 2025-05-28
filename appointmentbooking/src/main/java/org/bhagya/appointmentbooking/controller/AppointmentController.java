// src/main/java/com/bhagya/appointmentservice/controller/AppointmentController.java
package org.bhagya.appointmentbooking.controller;

import org.bhagya.appointmentbooking.model.*;
import org.bhagya.appointmentbooking.service.AppointmentService;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@Validated
public class AppointmentController {

    private final AppointmentService svc;
    private final RestTemplate restTemplate;
    private final String authServiceUrl = "http://auth-service:8081";

    public AppointmentController(AppointmentService svc, RestTemplate restTemplate) {
        this.svc = svc;
        this.restTemplate = restTemplate;
    }

    /** Get all doctors */
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        try {
            ResponseEntity<List> response = restTemplate.getForEntity(
                authServiceUrl + "/api/users/providers",
                List.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching doctors: " + e.getMessage());
        }
    }

    /** Create a slot (doctor side) */
    @PostMapping("/slots")
    public ResponseEntity<AppointmentSlot> createSlot(
            @Valid @RequestBody AppointmentSlot slot) {
        AppointmentSlot created = svc.createSlot(slot);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** List available slots for a doctor */
    @GetMapping("/slots")
    public ResponseEntity<List<AppointmentSlot>> listSlots(
            @RequestParam @NotNull Long doctorId) {
        return ResponseEntity.ok(svc.listAvailableSlots(doctorId));
    }

    /** Book a slot (patient side) */
    @PostMapping("/book")
    public ResponseEntity<?> bookSlot(
            @RequestBody Map<String, Long> payload) {
        Long slotId = payload.get("slotId");
        Long patientId = payload.get("patientId");
        try {
            AppointmentBooking booking = svc.bookSlot(slotId, patientId);
            
//            // Send notification email
//            Map<String, Object> emailData = Map.of(
//                "to", payload.get("patientEmail"),
//                "subject", "Appointment Booked Successfully",
//                "body", "Your appointment has been booked successfully for " + booking.getSlot().getSlotTime()
//            );
//            restTemplate.postForEntity(
//                "http://notificationservice:8086/api/notifications/email",
//                emailData,
//                Void.class
//            );
//
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }
    }

    /** List bookings for a patient */
    @GetMapping("/bookings/patient/{patientId}")
    public ResponseEntity<List<AppointmentBooking>> listPatientBookings(
            @PathVariable @NotNull Long patientId) {
        return ResponseEntity.ok(svc.listBookings(patientId));
    }

    /** List bookings for a doctor */
    @GetMapping("/bookings/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentBooking>> listDoctorBookings(
            @PathVariable @NotNull Long doctorId) {
        return ResponseEntity.ok(svc.listDoctorBookings(doctorId));
    }

    /** Cancel a booking */
    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> cancel(
            @PathVariable Long id) {
        try {
            svc.cancelBooking(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }
    }
}

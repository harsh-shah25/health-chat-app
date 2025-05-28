package org.bhagya.notificationservice.controller;

import org.bhagya.notificationservice.dto.NotificationRequest;
import org.bhagya.notificationservice.dto.NotificationResponse;
import org.bhagya.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
@Validated
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * POST /api/notifications
     *
     * Example Request:
     * {
     *    "channel": "email",
     *    "recipient": "test@example.com",
     *    "subject": "Appointment Reminder",
     *    "message": "Your appointment is scheduled for tomorrow at 10:00 AM."
     * }
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> send(
            @Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        if ("SUCCESS".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

package org.bhagya.notificationservice.dto;

public class NotificationResponse {
    private String status;
    private String details;

    public NotificationResponse() {}

    public NotificationResponse(String status, String details) {
        this.status = status;
        this.details = details;
    }

    // Getters and setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}

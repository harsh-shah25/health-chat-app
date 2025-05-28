package com.bhagya.groupmessagingservice.model;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class GroupMessage implements Serializable {
    private UUID id;
    private String groupId;
    private String sender;
    private String content;
    private Instant timestamp;

    public GroupMessage() {
        this.id = UUID.randomUUID();
        this.timestamp = Instant.now();
    }

    // Getters & Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getGroupId() { return groupId; }
    public void setGroupId(String g) { this.groupId = g; }
    public String getSender() { return sender; }
    public void setSender(String s) { this.sender = s; }
    public String getContent() { return content; }
    public void setContent(String c) { this.content = c; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant t) { this.timestamp = t; }
}

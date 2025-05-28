package com.bhagya.onetoonemessagingservice.service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaMessageListener {

    @KafkaListener(topics = "messages_topic", groupId = "message_group")
    public void listen(String status) {
        System.out.println("📥 Received Kafka event: " + status);
        // TODO: Integrate with WebSocket or notification system here
    }
}

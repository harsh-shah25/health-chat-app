package com.bhagya.onetoonemessagingservice.Controller;

import com.bhagya.onetoonemessagingservice.model.Message;
import com.bhagya.onetoonemessagingservice.Repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/messages")
@Validated
public class MessagingController {

    private static final String TOPIC = "messages_topic";

    @Autowired
    private MessageRepository repo;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(@RequestParam String user1,
                                                         @RequestParam String user2) {
        String conversationId = generateConversationId(user1, user2);
        List<Message> messages = repo.findAllByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody @Valid Message msg) {
        String conversationId = generateConversationId(msg.getSender(), msg.getReceiver());
        msg.setConversationId(conversationId);
        msg.setTimestamp(Instant.now());
        msg.setMessageId(UUID.randomUUID());
        Message saved = repo.save(msg);
        kafkaTemplate.send(TOPIC, saved.getMessageId().toString(), "sent");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private String generateConversationId(String user1, String user2) {
        return Stream.of(user1, user2).sorted().collect(Collectors.joining("_"));
    }


}

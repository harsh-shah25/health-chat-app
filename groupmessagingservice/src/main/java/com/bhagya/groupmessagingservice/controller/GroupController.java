package com.bhagya.groupmessagingservice.controller;

import com.bhagya.groupmessagingservice.model.GroupMessage;
import com.bhagya.groupmessagingservice.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import java.util.*;

@RestController
@RequestMapping("/api/groups")
@Validated
public class GroupController {

    @Autowired
    private GroupService service;

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestParam @NotBlank String name) {
        String id = service.createGroup(name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("groupId", id, "groupName", name));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> list() {
        Map<Object, Object> entries = service.listGroups();
        List<Map<String, String>> out = new ArrayList<>();
        entries.forEach((k,v) -> out.add(Map.of("groupId", k.toString(), "groupName", v.toString())));
        return ResponseEntity.ok(out);
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> join(@PathVariable String groupId,
                                  @RequestParam @NotBlank String username) {
        if (!service.groupExists(groupId))
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Group not found");
        service.joinGroup(groupId, username);
        return ResponseEntity.ok("Joined group");
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> members(@PathVariable String groupId) {
        if (!service.groupExists(groupId))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");
        Set<Object> members = service.getMembers(groupId);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/{groupId}/messages")
    public ResponseEntity<GroupMessage> postMessage(@PathVariable String groupId,
                                                    @RequestParam @NotBlank String sender,
                                                    @RequestParam @NotBlank String content) {
        if (!service.groupExists(groupId))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

        GroupMessage msg = new GroupMessage();
        msg.setGroupId(groupId);
        msg.setSender(sender);
        msg.setContent(content);
        service.saveMessage(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String groupId) {
        if (!service.groupExists(groupId))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Group not found");

        List<Object> msgs = service.getMessages(groupId);
        return ResponseEntity.ok(msgs);
    }
}

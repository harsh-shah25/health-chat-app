package com.bhagya.groupmessagingservice.service;

import com.bhagya.groupmessagingservice.model.GroupMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GroupService {

    @Autowired
    private RedisTemplate<String, Object> redis;

    // prefix utils
    private String infoKey()        { return "groups:info"; }
    private String membersKey(String g){ return "group:" + g + ":members"; }
    private String messagesKey(String g){ return "group:" + g + ":messages"; }

    // Create a new community/group
    public String createGroup(String name) {
        String id = UUID.randomUUID().toString();
        redis.opsForHash().put(infoKey(), id, name);
        return id;
    }

    public Map<Object, Object> listGroups() {
        return redis.opsForHash().entries(infoKey());
    }

    public boolean groupExists(String groupId) {
        return redis.opsForHash().hasKey(infoKey(), groupId);
    }

    // Member management
    public void joinGroup(String groupId, String username) {
        redis.opsForSet().add(membersKey(groupId), username);
    }

    @SuppressWarnings("unchecked")
    public Set<Object> getMembers(String groupId) {
        return redis.opsForSet().members(membersKey(groupId));
    }

    // Message management
    public void saveMessage(GroupMessage msg) {
        redis.opsForList().rightPush(messagesKey(msg.getGroupId()), msg);
    }

    @SuppressWarnings("unchecked")
    public List<Object> getMessages(String groupId) {
        return redis.opsForList().range(messagesKey(groupId), 0, -1);
    }
}

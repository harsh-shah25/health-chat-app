package com.bhagya.onetoonemessagingservice.Repository;

import com.bhagya.onetoonemessagingservice.model.Message;
import org.springframework.data.cassandra.repository.CassandraRepository;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends CassandraRepository<Message, UUID> {
    List<Message> findAllByConversationId(String conversationId);

}

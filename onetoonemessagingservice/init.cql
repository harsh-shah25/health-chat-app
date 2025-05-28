CREATE KEYSPACE IF NOT EXISTS messaging
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE messaging;

CREATE TABLE IF NOT EXISTS messages (
                                        conversation_id text,
                                        timestamp timestamp,
                                        message_id UUID,
                                        sender text,
                                        receiver text,
                                        content text,
                                        PRIMARY KEY ((conversation_id), timestamp)
) WITH CLUSTERING ORDER BY (timestamp ASC);

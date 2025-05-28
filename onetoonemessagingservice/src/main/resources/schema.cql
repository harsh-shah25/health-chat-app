DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
                          conversation_id text,
                          timestamp timestamp,
                          message_id UUID,
                          sender text,
                          receiver text,
                          content text,
                          PRIMARY KEY ((conversation_id), timestamp)
) WITH CLUSTERING ORDER BY (timestamp ASC);

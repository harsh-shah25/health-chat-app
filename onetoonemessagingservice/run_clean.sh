#!/bin/bash

set -e

echo "⏳ Waiting for Cassandra to be ready..."

until cqlsh cassandra 9042 -e "DESCRIBE KEYSPACES" &> /dev/null; do
  echo "🕐 Still waiting for Cassandra to be ready..."
  sleep 5
done

echo "✅ Cassandra is up. Running CQL commands..."

# Use a HEREDOC for multiple CQL commands
cqlsh cassandra 9042 <<EOF
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
EOF

echo "🏁 Keyspace 'messaging' and table 'messages' initialized successfully!"

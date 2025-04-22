-- Add down migration script here

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_contacts_sender_id ON contacts(sender_id);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_contacts_recv_id ON contacts(recv_id);

DROP INDEX idx_unique_contacts_recv_id_sender_id;

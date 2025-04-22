-- Add up migration script here
DROP INDEX idx_unique_contacts_sender_id;

DROP INDEX idx_unique_contacts_recv_id;


CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_contacts_recv_id_sender_id ON contacts(sender_id, recv_id);

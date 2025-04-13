-- Add down migration script here

DROP TABLE users;
DROP TABLE contacts;
DROP TABLE messages;

DROP INDEX idx_unique_users_email;
DROP INDEX idx_unique_users_id;
DROP INDEX idx_unique_users_username;
DROP INDEX idx_unique_messages_id;
DROP INDEX idx_unique_contacts_recv_id;


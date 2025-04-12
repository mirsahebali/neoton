-- This file should undo anything in `up.sql`

ALTER TABLE messages
	DROP CONSTRAINT fk_sender_message_user;

ALTER TABLE messages
	DROP CONSTRAINT fk_recv_message_user;

ALTER TABLE contacts
	DROP CONSTRAINT fk_recv_contacts;

ALTER TABLE contacts
	DROP CONSTRAINT fk_sender_contacts;

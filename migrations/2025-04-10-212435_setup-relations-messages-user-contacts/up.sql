-- Your SQL goes here
ALTER TABLE messages
	ADD CONSTRAINT fk_sender_message_user
	FOREIGN KEY (sender_id) REFERENCES users(id);

ALTER TABLE messages
	ADD CONSTRAINT fk_recv_message_user
	FOREIGN KEY(recv_id) REFERENCES users(id);

ALTER TABLE contacts
	ADD CONSTRAINT fk_recv_contacts
	FOREIGN KEY(recv_id) REFERENCES users(id);

ALTER TABLE contacts
	ADD CONSTRAINT fk_sender_contacts
	FOREIGN KEY(sender_id) REFERENCES users(id);

-- Your SQL goes here

CREATE TABLE user_contacts (
	sender_id INTEGER REFERENCES users(id),
	recv_id INTEGER REFERENCES users(id),
	PRIMARY KEY(sender_id, recv_id)
);

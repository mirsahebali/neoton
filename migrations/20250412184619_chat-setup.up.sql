-- Add up migration script here

CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	username VARCHAR(14) NOT NULL UNIQUE,
	fullname VARCHAR(40) NOT NULL DEFAULT '',
	profile_image TEXT,
	email VARCHAR(70) NOT NULL UNIQUE,
	hashed_password TEXT NOT NULL,
	is_verified BOOLEAN NOT NULL DEFAULT false,
	enabled_2fa BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
	sender_id INTEGER NOT NULL,
	recv_id INTEGER NOT NULL,
	request_accepted BOOLEAN NOT NULL DEFAULT false,
	sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	FOREIGN KEY(sender_id) REFERENCES users(id),
	FOREIGN KEY(recv_id) REFERENCES users(id),
	PRIMARY KEY(sender_id, recv_id)
);

CREATE TABLE IF NOT EXISTS messages (
	id SERIAL PRIMARY KEY NOT NULL UNIQUE,
	content TEXT NOT NULL,
	sender_id INTEGER NOT NULL,
	recv_id INTEGER NOT NULL,
	sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	is_delivered BOOLEAN NOT NULL DEFAULT false,
	is_seen BOOLEAN NOT NULL DEFAULT false,
	is_file BOOLEAN NOT NULL DEFAULT false,
	FOREIGN KEY(sender_id) REFERENCES users(id),
	FOREIGN KEY(recv_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_users_email ON users(email);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_users_id ON users(id);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_users_username ON users(username);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_messages_id ON messages(id);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_contacts_sender_id ON contacts(sender_id);

CREATE UNIQUE INDEX  IF NOT EXISTS idx_unique_contacts_recv_id ON contacts(recv_id);

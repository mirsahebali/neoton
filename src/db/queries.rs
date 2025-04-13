use sqlx::{Pool, Postgres};

use crate::models::User;

pub async fn get_one_user_by_email(
    conn: &Pool<Postgres>,
    email: String,
) -> Result<User, sqlx::Error> {
    sqlx::query_as("SELECT * FROM users WHERE email = $1")
        .bind(email)
        .fetch_one(conn)
        .await
}

pub async fn get_user_invites(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<User>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT (email, username, users.id) 
            FROM users 
            JOIN contacts 
            ON users.id = contacts.recv_id 
            WHERE contacts.request_accepted = false AND contacts.recv_id = $1
            "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

pub async fn get_user_requests(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<User>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT (email, username, users.id) 
            FROM users 
            JOIN contacts 
            ON users.id = contacts.sender_id 
            WHERE contacts.request_accepted = false AND contacts.sender_id = $1
            "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

pub async fn get_user_contacts(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<User>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT (users.id, email, username) 
            FROM users 
            JOIN contacts 
            ON users.id = contacts.recv_id 
            UNION
            SELECT (users.id, email, username) 
            FROM users 
            JOIN contacts 
            ON users.id = contacts.sender_id
            WHERE 
            contacts.request_accepted = true 
            AND 
            (contacts.sender_id = $1 OR contacts.recv_id = $1)
            "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

pub async fn get_user_conversations(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<User>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT (messages.content, messages.sent_at, users.username, users.id) 
            FROM messages 
            JOIN users
            ON users.id = messages.recv_id 
            UNION
            SELECT (messages.content, messages.sent_at, users.username, users.id) 
            FROM messages 
            JOIN users
            ON users.id = messages.sender_id 
            WHERE 
            (messages.sender_id = $1 OR messages.recv_id = $1)
        "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

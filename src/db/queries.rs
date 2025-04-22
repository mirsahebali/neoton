use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres, prelude::FromRow};

use crate::models::User;

#[derive(Serialize, Deserialize, Debug)]
pub enum GetUserBy {
    Email(String),
    Username(String),
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct SelectUser {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub profile_image: String,
}

pub async fn get_one_user_by_username(
    conn: &Pool<Postgres>,
    username: &String,
) -> Result<SelectUser, sqlx::Error> {
    sqlx::query_as(
        r#"SELECT id, username, email, profile_image FROM users WHERE username = $1 LIMIT 1"#,
    )
    .bind(username)
    .fetch_one(conn)
    .await
}

pub async fn get_one_user_by_email(
    conn: &Pool<Postgres>,
    email: String,
) -> Result<User, sqlx::Error> {
    sqlx::query_as("SELECT * FROM users WHERE email = $1 LIMIT 1")
        .bind(email)
        .fetch_one(conn)
        .await
}

pub async fn get_user_invites(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<SelectUser>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT email, username, users.id, profile_image
            FROM users 
            JOIN contacts 
            ON users.id = contacts.recv_id 
            WHERE contacts.request_accepted = false AND contacts.recv_id = $1
            LIMIT 5
            "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

pub async fn get_user_requests(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<SelectUser>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT email, username, users.id, profile_image
            FROM users 
            JOIN contacts 
            ON users.id = contacts.sender_id 
            WHERE contacts.request_accepted = false AND contacts.sender_id = $1
            LIMIT 5
            "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

pub async fn get_user_contacts(
    conn: &Pool<Postgres>,
    user_id: i32,
) -> Result<Vec<SelectUser>, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as(
        r#"
            SELECT users.id, email, username, profile_image 
            FROM users 
            JOIN contacts 
            ON users.id = contacts.recv_id 
            WHERE 
            contacts.request_accepted = true 
            UNION
            SELECT users.id, email, username, profile_image  
            FROM users 
            JOIN contacts 
            ON users.id = contacts.sender_id
            WHERE 
            contacts.request_accepted = true 
            AND 
            users.id = $1
            LIMIT 5
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
            SELECT messages.content, messages.sent_at, users.username, users.id 
            FROM messages 
            JOIN users
            ON users.id = messages.recv_id 
            UNION
            SELECT messages.content, messages.sent_at, users.username, users.id 
            FROM messages 
            JOIN users
            ON users.id = messages.sender_id 
            WHERE 
            (messages.sender_id = $1 OR messages.recv_id = $1)
            LIMIT 5
        "#,
    )
    .bind(user_id)
    .fetch_all(conn)
    .await
}

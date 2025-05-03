use chrono::Utc;
use sqlx::{Pool, Postgres, postgres::PgQueryResult, prelude::FromRow};

use crate::{models::User, utils::hash_password};

pub async fn create_new_user(
    conn: &Pool<Postgres>,
    email: String,
    username: String,
    plain_password: String,
    fullname: String,
    enable_2fa: bool,
) -> Result<User, sqlx::Error> {
    tracing::info!("Active Connections: {}", conn.size());
    sqlx::query_as!(
        User,
        "INSERT INTO users
        (email, username, hashed_password, fullname, enabled_2fa)
        values($1, $2, $3, $4, $5)
        RETURNING *",
        email,
        username,
        hash_password(plain_password),
        fullname,
        enable_2fa
    )
    .fetch_one(conn)
    .await
}

pub async fn add_user_invite(
    conn: &Pool<Postgres>,
    sender_id: i32,
    recv_id: i32,
) -> Result<PgQueryResult, sqlx::Error> {
    sqlx::query!(
        "INSERT INTO contacts(sender_id, recv_id) VALUES ($1, $2)",
        sender_id,
        recv_id
    )
    .execute(conn)
    .await
}

pub async fn accept_user_invite_db(
    conn: &Pool<Postgres>,
    recv_id: i32,
    sender_id: i32,
) -> Result<PgQueryResult, sqlx::Error> {
    sqlx::query!(
        "UPDATE contacts SET request_accepted = true WHERE recv_id = $1 AND sender_id = $2",
        recv_id,
        sender_id
    )
    .execute(conn)
    .await
}

#[derive(Debug)]
pub enum NewMessageError {
    UserNotFound,
    DB(sqlx::Error),
}

#[derive(FromRow, Debug)]
pub struct UserId {
    pub id: i32,
}

pub async fn add_new_message(
    conn: &Pool<Postgres>,
    sender_id: i32,
    recv_username: &String,
    content: &String,
) -> Result<(), NewMessageError> {
    let recv_user_res = sqlx::query_as!(
        UserId,
        "SELECT id from users WHERE username = $1 LIMIT 1",
        recv_username
    )
    .fetch_one(conn)
    .await;

    match recv_user_res {
        Ok(user) => {
            if let Err(err) = sqlx::query!(
                "INSERT INTO messages(sender_id, recv_id, content, sent_at) VALUES ($1, $2, $3, $4)",
                sender_id,
                user.id,
                content,
                Utc::now()
            ).execute(conn).await{
                Err(NewMessageError::DB(err))
            }else{
                Ok(())
            }
        }
        Err(err) => {
            if let sqlx::Error::RowNotFound = err {
                Err(NewMessageError::UserNotFound)
            } else {
                Err(NewMessageError::DB(err))
            }
        }
    }
}

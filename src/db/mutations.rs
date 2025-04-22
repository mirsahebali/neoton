use sqlx::{Pool, Postgres, postgres::PgQueryResult};

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

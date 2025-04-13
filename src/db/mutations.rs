use sqlx::{Pool, Postgres};

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

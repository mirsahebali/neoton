use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, Deserialize, Debug, PartialEq, PartialOrd, FromRow)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub fullname: String,
    pub profile_image: Option<String>,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub is_verified: bool,
    pub enabled_2fa: bool,
    pub hashed_password: String,
}

#[derive(Deserialize, Serialize, Debug, FromRow)]
pub struct Contact {
    pub sender_id: Option<i32>,
    pub recv_id: Option<i32>,
    pub request_accepted: bool,
    pub sent_at: DateTime<Utc>,
}

#[derive(Deserialize, Serialize, Debug, FromRow)]
pub struct Message {
    pub sender_id: i32,
    pub recv_id: i32,
    pub content: String,
    pub sent_at: DateTime<Utc>,
}

use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::Deserialize;
use serde::Serialize;

#[derive(Queryable, Deserialize, Selectable, Serialize, Debug)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub created_at: NaiveDateTime,
    pub is_verified: Option<bool>,
    pub enabled_2fa: Option<bool>,
    pub hashed_password: String,
}

#[derive(Queryable, Deserialize, Selectable, Serialize, Debug)]
#[diesel(table_name = crate::schema::contacts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Contact {
    pub sender_id: Option<i32>,
    pub recv_id: Option<i32>,
    pub request_accepted: bool,
    pub sent_at: NaiveDateTime,
}

#[derive(Queryable, Deserialize, Selectable, Serialize, Debug)]
#[diesel(table_name = crate::schema::messages)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Message {
    pub sender_id: i32,
    pub recv_id: i32,
    pub content: String,
    pub sent_at: NaiveDateTime,
}

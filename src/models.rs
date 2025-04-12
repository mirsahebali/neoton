use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::Deserialize;
use serde::Serialize;

#[derive(
    Queryable, Selectable, Identifiable, Serialize, Deserialize, Debug, PartialEq, PartialOrd,
)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub created_at: NaiveDateTime,
    pub is_verified: bool,
    pub enabled_2fa: bool,
    pub hashed_password: String,
}

#[derive(
    Queryable, Selectable, Identifiable, Serialize, Deserialize, Debug, PartialEq, PartialOrd,
)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct SenderUser {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub created_at: NaiveDateTime,
    pub is_verified: bool,
    pub enabled_2fa: bool,
    pub hashed_password: String,
}

#[derive(
    Queryable, Selectable, Identifiable, Serialize, Deserialize, Debug, PartialEq, PartialOrd,
)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct RecvUser {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub created_at: NaiveDateTime,
    pub is_verified: bool,
    pub enabled_2fa: bool,
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

type Sender = SenderUser;
type Recv = RecvUser;

#[derive(Identifiable, Selectable, Queryable, Associations, Debug)]
#[diesel(belongs_to(Sender))]
#[diesel(belongs_to(Recv))]
#[diesel(table_name = crate::schema::users_contacts)]
#[diesel(primary_key(sender_id, recv_id))]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct UsersContacts {
    pub sender_id: i32,
    pub recv_id: i32,
}

use crate::{
    AppState,
    db::{
        mutations::add_user_invite,
        queries::{GetUserBy, get_one_user_by_username},
    },
};
use serde::{Deserialize, Serialize};
use socketioxide::{
    extract::{AckSender, Data, SocketRef, State},
    handler::Value,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct InviteUserData {
    pub sender: SenderData,
    pub recv_username: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SenderData {
    pub username: String,
    pub id: i32,
}

#[derive(Debug)]
enum InviteError {
    UserNotFound,
    AlreadySent,
    OtherError(sqlx::Error),
}

pub async fn invite_user(s: SocketRef, Data(data): Data<InviteUserData>, pool: State<AppState>) {
    let InviteUserData {
        ref sender,
        ref recv_username,
    } = data;

    let recv_user = get_one_user_by_username(&pool.pool, recv_username).await;

    match recv_user {
        Ok(recv_user) => {
            let res = add_user_invite(&pool.pool, sender.id, recv_user.id).await;

            // this error handles if the invitation was created
            if let Err(err) = res {
                let (err_message, err) = get_invite_db_error(err);
                tracing::error!("error adding invitation: {err_message}");
                tracing::error!("{err:?}");
                if let Err(err) = s.emit(format!("error:{}", sender.username), &err_message) {
                    tracing::error!("Error emmitting error event: {err}")
                };
                return;
            }
            let event_name = dbg!(format!("invitation:{}", recv_user.username));

            if let Err(err) = s.broadcast().emit(event_name, &data).await {
                tracing::error!("Error emitting accept with not ack invitation event: {err}");
                return;
            };

            tracing::info!("invitation: {} -> {}", sender.username, recv_username);
        }
        // this error handles if the user exist
        Err(err) => {
            tracing::error!("ERROR getting user: {err:?}");
            let (err_message, _) = get_user_db_error(err);
            let error_event_name = dbg!(format!("error:{}", sender.username));
            if let Err(err) = s.emit(error_event_name, &err_message) {
                tracing::error!("Error emitting error event: {err}")
            };
        }
    };
}

fn get_invite_db_error(err: sqlx::Error) -> (String, InviteError) {
    match err {
        sqlx::Error::RowNotFound => ("User not found".to_string(), InviteError::UserNotFound),
        sqlx::Error::Database(db_err) => {
            tracing::error!("{db_err}");
            match db_err.kind() {
                sqlx::error::ErrorKind::UniqueViolation => (
                    "Request already sent to user".to_string(),
                    InviteError::AlreadySent,
                ),
                _ => (
                    format!("{:?}", db_err),
                    InviteError::OtherError(sqlx::Error::Database(db_err)),
                ),
            }
        }

        _ => (
            "Internal server error".to_string(),
            InviteError::OtherError(err),
        ),
    }
}

fn get_user_db_error(err: sqlx::Error) -> (String, InviteError) {
    match err {
        sqlx::Error::RowNotFound => ("User not found".to_string(), InviteError::UserNotFound),
        _ => (
            "Internal server error".to_string(),
            InviteError::OtherError(err),
        ),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AcceptUserData {
    /// the user which sent the request
    sender_username: String,
    /// the user which accepted the request
    recv_username: String,
}

pub async fn accept_user_invite(
    s: SocketRef,
    Data(data): Data<Vec<String>>,
    pool: State<AppState>,
) {
    tracing::info!("accepted: {} - {}", data[0], data[1]);
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageData {
    /// the user which sent the request
    sender_username: String,
    /// the user which accepted the request
    recv_username: String,
}

pub async fn message_user(s: SocketRef, Data(data): Data<Vec<String>>, pool: State<AppState>) {
    tracing::info!("accepted: {} - {}", data[0], data[1]);
}

use crate::{
    AppState,
    db::{
        mutations::{accept_user_invite_db, add_user_invite},
        queries::{GetUserBy, get_id_user_db, get_one_user_by_username},
    },
};
use serde::{Deserialize, Serialize};
use socketioxide::{
    extract::{AckSender, Data, SocketRef, State},
    handler::Value,
};
use tracing::{error, info};

type Error = sqlx::Error;

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
    pub current: SenderData,
    pub sender_username: String,
}

pub async fn accept_user_invite(
    s: SocketRef,
    Data(data): Data<AcceptUserData>,
    State(app_state): State<AppState>,
) {
    let AcceptUserData {
        current,
        sender_username,
    } = dbg!(data);

    match get_id_user_db(&app_state.pool, &sender_username).await {
        Ok((sender_id,)) => {
            dbg!("sender id ", sender_id, "recv id", &current.id);

            let error_event_name = format!("error:{}", &current.username);
            if let Err(err) = accept_user_invite_db(&app_state.pool, current.id, sender_id).await {
                error!("ERROR accepting user invite in db: {err}");
                let _ = s
                    .broadcast()
                    .emit(&error_event_name, "Error accepting user request")
                    .await
                    .map_err(|err| error!("ERROR emitting event: {error_event_name}: {err}"));
                return;
            }
            let event_name = format!("accepted:{sender_username}");
            let _ = s
                .broadcast()
                .emit(&event_name, &current.username)
                .await
                .map_err(|err| error!("ERROR emitting event: {event_name}, {err}"));
        }
        Err(err) => {
            error!("Error getting user: {err}");
            let error_event_name = format!("error:{}", &current.username);
            if let Error::RowNotFound = err {
                let _ = s
                    .broadcast()
                    .emit(&error_event_name, "User not found")
                    .await
                    .map_err(|err| error!("ERROR emitting event: {error_event_name}: {err}"));
            } else {
                let _ = s
                    .broadcast()
                    .emit(&error_event_name, "Internal Server Error")
                    .await
                    .map_err(|err| error!("ERROR emitting event: {error_event_name}: {err}"));
            }
        }
    };
}

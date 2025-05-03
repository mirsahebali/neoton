use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use socketioxide::extract::{Data, SocketRef, State};
use tracing::{error, info};

use crate::{
    AppState,
    db::mutations::{NewMessageError, add_new_message},
};

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageDataIn {
    sender_id: i32,
    recv_username: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageDataOut {
    sender_id: i32,
    recv_username: String,
    content: String,
    sent_at: DateTime<Utc>,
}

pub async fn send_message(
    s: SocketRef,
    Data(data): Data<MessageDataIn>,
    State(app_state): State<AppState>,
) {
    let MessageDataIn {
        recv_username,
        sender_id,
        content,
    } = data;
    let message_out = dbg!(MessageDataOut {
        recv_username,
        sender_id,
        sent_at: Utc::now(),
        content,
    });
    if let Err(err) = add_new_message(
        &app_state.pool,
        message_out.sender_id,
        &message_out.recv_username,
        &message_out.content,
    )
    .await
    {
        error!("ERROR adding new message: {err:?}");
        let error_event_name = format!("error:{}", sender_id);
        if let NewMessageError::UserNotFound = err {
            let _ = s
                .emit(&error_event_name, "User not found")
                .map_err(|err| error!("ERROR emmitting error event: {error_event_name}: {err}"));
        } else {
            let _ = s
                .emit(&error_event_name, "Internal server error")
                .map_err(|err| error!("ERROR emmitting error event: {error_event_name}: {err}"));
        }
        return;
    };

    let accept_event_name = format!("accept:{}", &message_out.recv_username);
    info!("{accept_event_name}");

    if let Err(err) = s.broadcast().emit(&accept_event_name, &message_out).await {
        error!("ERROR emitting {accept_event_name}: {err}");
    };
}

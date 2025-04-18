use crate::AppState;
use serde::{Deserialize, Serialize};
use socketioxide::extract::{AckSender, Data, SocketRef, State};

#[derive(Debug, Serialize, Deserialize)]
pub struct InviteUserData {
    sender: _SenderData,
    recv_username: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct _SenderData {
    username: String,
    id: i32,
}

pub async fn invite_user(
    s: SocketRef,
    Data(data): Data<InviteUserData>,
    ack: AckSender,
    pool: State<AppState>,
) {
    tracing::info!(
        "invitation: {} - {}",
        data.sender.username,
        data.recv_username
    );
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AcceptUserData {
    /// the user which sent the request
    sender_username: String,
    /// the user which accepted the request
    recv_username: String,
}

pub async fn accept_user(
    s: SocketRef,
    Data(data): Data<AcceptUserData>,
    ack: AckSender,
    pool: State<AppState>,
) {
    tracing::info!(
        "accepted: {} - {}",
        data.recv_username,
        data.sender_username
    );
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageData {
    /// the user which sent the request
    sender_username: String,
    /// the user which accepted the request
    recv_username: String,
}

pub async fn message_user(
    s: SocketRef,
    Data(data): Data<Vec<String>>,
    ack: AckSender,
    pool: State<AppState>,
) {
    tracing::info!("accepted: {} - {}", data[0], data[1]);
}

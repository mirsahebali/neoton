use crate::AppState;
use socketioxide::extract::{AckSender, Data, SocketRef, State};

pub async fn invite_user(
    s: SocketRef,
    Data(data): Data<Vec<String>>,
    ack: AckSender,
    pool: State<AppState>,
) {
    tracing::info!("invitation: {} - {}", data[0], data[1]);
}

use rand::{Rng, distr::Alphanumeric};
use redis::{AsyncCommands, JsonAsyncCommands, RedisResult};
use serde::{Deserialize, Serialize};
use socketioxide::extract::{Data, SocketRef, State};
use time::Duration;
use tracing::{error, info};

use crate::{
    AppState,
    utils::{time_now_ms_with_exp, time_now_ns},
};
#[derive(Debug, Deserialize, Serialize)]
pub struct CreateVideoData {
    pub sender_username: String,
    pub recv_username: String,
    pub sdp: rmpv::Value,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct InviteVideoData {
    pub sender_username: String,
    pub sdp: rmpv::Value,
}

pub async fn create_video_call(
    s: SocketRef,
    Data(create_call_data): Data<CreateVideoData>,
    State(app_state): State<AppState>,
) {
    info!("Triggered");
    let room_id: String = rand::rng()
        .sample_iter(&Alphanumeric)
        .take(7)
        .map(char::from)
        .collect();

    if !s.within(room_id.clone()).sockets().is_empty() {
        let error_event_name = format!("error:{}", create_call_data.sender_username);
        let _ = s
            .broadcast()
            .emit(&error_event_name, "Room already created")
            .await
            .map_err(|err| error!("ERROR emmitting {error_event_name}: {err}"));
        return;
    }
    s.join(room_id.clone());
    let created_event_name = format!("created:{}", create_call_data.sender_username);

    info!("Event: {created_event_name} emitted");

    let _ = s
        .emit(&created_event_name, &room_id)
        .map_err(|err| error!("broadcast error emitting {created_event_name}: {err}"));

    let invite_user_event_name = format!("invite:video:{}", create_call_data.recv_username);

    let invite_video_data = InviteVideoData {
        sender_username: create_call_data.sender_username.clone(),
        sdp: create_call_data.sdp,
    };

    let _ = s
        .broadcast()
        .emit(&invite_user_event_name, &invite_video_data)
        .await
        .map_err(|err| {
            error!("emitting event: {invite_user_event_name}, {err}");
        });

    let mut kv_pool = app_state.kv_pool.clone();

    let call_room_key = format!(
        "room:{}:{}",
        create_call_data.sender_username, create_call_data.recv_username
    );

    let _ = kv_pool
        .json_set::<&String, &str, String, String>(&call_room_key, "room_id", &room_id)
        .await
        .map_err(|err| error!("ERROR setting call_room_key for path 'room_id': {err}"));

    let _ = kv_pool
        .json_set::<&String, &str, i128, String>(
            &call_room_key,
            "exp",
            &time_now_ms_with_exp(Duration::seconds(90)),
        )
        .await
        .map_err(|err| error!("ERROR setting call_room_key for path 'exp': {err}"));
}

#[derive(Debug, Deserialize, Serialize)]
pub struct JoinCallData {
    pub sender_username: String,
    pub recv_username: String,
    pub sdp: rmpv::Value,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AcceptCallData {
    pub recv_username: String,
    pub sdp: rmpv::Value,
}

pub async fn join_video_call(
    s: SocketRef,
    Data(room_data): Data<JoinCallData>,
    State(app_state): State<AppState>,
) {
    let call_room_key = format!(
        "room:{}:{}",
        &room_data.sender_username, &room_data.recv_username
    );

    let err_event_name = format!("error:join:{}", &room_data.recv_username);
    let mut kv_pool = app_state.kv_pool.clone();

    let room_id: Option<String> = kv_pool.json_get(&call_room_key, "room_id").await.ok();

    if room_id.is_none() {
        let _ = s
            .emit(&err_event_name, "Invalid Key to join")
            .map_err(|err| error!("error emitting {}, {err}", &err_event_name));
        return;
    }

    let room_id = room_id.unwrap();

    let exp: Option<i128> = kv_pool.json_get(&call_room_key, "exp").await.ok();
    if exp.is_none() {
        error!("EXP key was not set");
        let _ = s
            .emit(&err_event_name, "Invalid key to join")
            .map_err(|err| error!("error emitting {}, {err}", &err_event_name));
        return;
    }

    let exp = exp.unwrap();

    if time_now_ns() >= exp {
        error!("Expired call join session");
        let _ = s
            .emit(&err_event_name, "Expired call join session")
            .map_err(|err| error!("error emitting {}, {err}", &err_event_name));
        return;
    }

    s.join(room_id.clone());

    let accepted_event_name = format!("accepted:{}", &room_data.sender_username);

    let accepted_data = AcceptCallData {
        recv_username: room_data.recv_username,
        sdp: room_data.sdp,
    };
    let _ = s
        .to(room_id)
        .broadcast()
        .emit(&accepted_event_name, &accepted_data)
        .await
        .map_err(|err| error!("ERROR emitting {accepted_event_name}, {err}"));
}

pub async fn hangup_video_call(
    s: SocketRef,
    Data(room_data): Data<JoinCallData>,
    State(app_state): State<AppState>,
) {
}

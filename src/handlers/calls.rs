#![allow(dead_code)]
#![allow(unused)]
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

impl CreateVideoData {
    pub fn to_invite_data(&self) -> InviteVideoData {
        InviteVideoData {
            sdp: self.sdp.clone(),
            sender_username: self.sender_username.clone(),
        }
    }
}

#[derive(Debug, Deserialize, Serialize)]
pub struct InviteVideoData {
    pub sender_username: String,
    pub sdp: rmpv::Value,
}

pub async fn create_video_invite(
    s: SocketRef,
    Data(data): Data<CreateVideoData>,
    State(app_state): State<AppState>,
) {
    let event_name = format!("video:invite:{}", data.recv_username);
    let room_id = rand::random_iter::<char>()
        .filter(|c| c.is_alphanumeric())
        .take(5)
        .collect::<String>();

    let mut kv_pool = app_state.kv_pool.clone();

    if let Err(err) = kv_pool.set::<&str, &str, ()>(&event_name, &room_id).await {
        error!("ERROR setting value in redis: {event_name}")
    };
    s.join(room_id.clone());
    if let Err(err) = s
        .broadcast()
        .emit(&event_name, &data.to_invite_data())
        .await
    {
        error!("ERROR: emitting event: {event_name}")
    };
    info!(
        "Call invite: {} -> {}",
        data.sender_username, data.recv_username
    )
}

#[derive(Debug, Deserialize, Serialize)]
pub struct JoinCallData {
    pub accepted: bool,
    pub sender_username: String,
    pub recv_username: String,
    pub sdp: Option<rmpv::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ResponseCallData {
    pub recv_username: String,
    pub sender_username: String,
    pub sdp: Option<rmpv::Value>,
    pub accepted: bool,
}

pub async fn respond_video_invite(
    s: SocketRef,
    Data(data): Data<ResponseCallData>,
    State(app_state): State<AppState>,
) {
    let event_name = format!("video:response:{}", &data.sender_username);
    let _ = s
        .broadcast()
        .emit(&event_name, &data)
        .await
        .map_err(|err| error!("ERROR sending event: {}: {err}", &event_name));
    let mut kv_pool = app_state.kv_pool.clone();
    if !data.accepted {
        info!(
            "{} declined {}'s call",
            &data.recv_username, &data.sender_username
        );
        let _ = kv_pool.del::<&str, String>(&event_name).await;
        return;
    }

    if let Ok(room_id) = kv_pool.get::<&str, String>(&event_name).await {
        info!(
            "{} accepted {}'s call",
            &data.recv_username, &data.sender_username
        )
    };
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ICECandidateData {
    pub sender_username: String,
    pub label: i32,
    pub candidate: String,
}

pub async fn send_ice_candidate(
    s: SocketRef,
    Data(room_data): Data<ICECandidateData>,
    State(app_state): State<AppState>,
) {
}

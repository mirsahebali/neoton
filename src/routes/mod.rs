use serde::{Deserialize, Serialize};

use crate::models::User;

#[derive(Serialize, Deserialize, Debug)]
pub struct ReturningResponse {
    pub error: bool,
    pub message: String,
    pub status: u16,
    pub user_data: Option<User>,
    pub enabled_2fa: bool,
}

pub mod auth;
pub mod email;
pub mod user;

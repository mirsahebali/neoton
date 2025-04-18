use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
pub struct ReturningResponse {
    pub error: bool,
    /// error message if any
    pub message: String,
    /// status code in u16
    pub status: u16,
    /// returing user data if any
    pub data: Option<Value>,
    pub enabled_2fa: bool,
}

pub mod auth;
pub mod email;
pub mod user;

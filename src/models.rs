use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sqlx::FromRow;
use url::Url;

#[derive(Serialize, Deserialize, Debug, PartialEq, PartialOrd, FromRow)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub fullname: String,
    pub profile_image: Option<String>,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub is_verified: bool,
    pub enabled_2fa: bool,
    pub hashed_password: String,
}

impl User {
    /// Convert to json value which will be *consumed* the binding
    pub fn to_json_value(self) -> Value {
        json!({
            "id": self.id,
            "email": self.email,
            "enabled_2fa": self.enabled_2fa,
            "username": self.username
        })
    }
}

#[derive(Deserialize, Serialize, Debug, FromRow)]
pub struct Contact {
    pub sender_id: Option<i32>,
    pub recv_id: Option<i32>,
    pub request_accepted: bool,
    pub sent_at: DateTime<Utc>,
}

#[derive(Deserialize, Serialize, Debug, FromRow)]
pub struct Message {
    pub sender_id: i32,
    pub recv_id: i32,
    pub content: String,
    pub sent_at: DateTime<Utc>,
}

#[derive(Deserialize, Serialize, Debug)]
pub enum FileTypes {
    /// png, jpg, jpeg, webp, etc
    Image,
    /// mp3, ogg, wav, etc
    Audio,
    /// mp4, mkv, mav, hpiec
    Video,
    /// pdf, doc, odt, xls(x)
    Document,
}

#[derive(Deserialize, Serialize, Debug, FromRow)]
pub struct FileBlobData {
    /// original name of the file
    pub name: String,
    /// computed hash to check the integrity of the file
    pub hash: String,
    /// File path in the OS
    pub path: String,
    /// type of file like image, audio, video, pdf, etc
    pub file_type: String,
    /// file size of file in bytes
    pub file_size: i32,
    /// created or last modified at
    pub modified_at: i128,
}

/// We can send and set event timers from the app
/// TODO: change it into a Serializeable valid time data structure
pub type Time = i32;

#[derive(Deserialize, Serialize, Debug)]
pub enum MessageType {
    Text(String),
    File(FileBlobData),
    Link(Url),
    /// We can send and set event timers from the app
    Timer(Time),
    /// User contact, for contact sharing
    User(User),
}

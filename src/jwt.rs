use std::sync::LazyLock;

use crate::{JWT_SECRET, models::User, utils::time_now};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};

pub struct Keys {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

impl Keys {
    pub fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}
pub static KEYS: LazyLock<Keys> = LazyLock::new(|| Keys::new(JWT_SECRET.as_bytes()));

#[derive(Serialize, Deserialize, Debug)]
pub struct UserClaims {
    pub username: String,
    pub email: String,
    pub hashed_password: String,
    pub enabled_2fa: bool,
    pub is_verified: bool,
    pub iat: u128,
    pub exp: u128,
}

impl UserClaims {
    pub fn is_expired(&self) -> bool {
        self.exp >= time_now()
    }
}

const EXP_TIME: u128 = 7 * 24 * 60 * 60 * 100;

impl UserClaims {
    pub fn new(user: &User) -> Self {
        let now_time = time_now();

        Self {
            username: user.username.clone(),
            email: user.email.clone(),
            hashed_password: user.hashed_password.clone(),
            enabled_2fa: user.enabled_2fa.unwrap(),
            is_verified: user.is_verified.unwrap(),
            iat: now_time,
            exp: now_time + EXP_TIME,
        }
    }
}

pub fn encode_jwt(user: UserClaims) -> String {
    match encode(
        &Header::new(jsonwebtoken::Algorithm::HS256),
        &user,
        &KEYS.encoding,
    ) {
        Ok(token) => token,
        Err(err) => {
            tracing::error!("ERROR encoding the token");
            tracing::error!("{err}");
            String::new()
        }
    }
}

pub fn decode_jwt(token: String) -> Option<UserClaims> {
    let claims = decode::<UserClaims>(
        &token,
        &KEYS.decoding,
        &Validation::new(jsonwebtoken::Algorithm::HS256),
    );
    match claims {
        Ok(token) => Some(token.claims),
        Err(err) => {
            tracing::error!("ERROR: decoding token");
            tracing::error!("{err}");
            None
        }
    }
}

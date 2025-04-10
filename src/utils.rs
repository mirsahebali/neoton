use std::time::{SystemTime, UNIX_EPOCH};

use crate::SALT_ROUNDS;
use bcrypt::{hash, verify};

pub fn hash_password(password: String) -> String {
    let hashed_password = hash(password, *SALT_ROUNDS);

    match hashed_password {
        Ok(hashed_password) => hashed_password,
        Err(err) => {
            tracing::error!("ERROR: hashing password");
            tracing::error!("{err}");
            String::new()
        }
    }
}

pub fn verify_password(password: String, hashed_password: String) -> bool {
    verify(password, &hashed_password).unwrap_or_default()
}

pub fn time_now() -> u128 {
    let now_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let now_millis = now_time.as_millis();
    now_millis
}

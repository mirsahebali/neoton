#![allow(dead_code)]

use std::{
    collections::HashMap,
    ops::Deref,
    sync::{Arc, LazyLock, Mutex},
};

use axum::extract::FromRef;
use axum_extra::extract::cookie::Key;
use diesel::{
    Connection, PgConnection,
    r2d2::{ConnectionManager, Pool},
};
use dotenvy::dotenv;
use otp::OTP;

pub static SALT_ROUNDS: LazyLock<u32> = LazyLock::new(|| {
    std::env::var("SALT_ROUNDS")
        .unwrap_or("10".into())
        .parse::<u32>()
        .expect("provide an integer for salt rounds")
});

pub static DATABASE_URL: LazyLock<String> =
    LazyLock::new(|| std::env::var("DATABASE_URL").expect("DATABASE_URL not set"));

pub static JWT_SECRET: LazyLock<String> =
    LazyLock::new(|| std::env::var("JWT_SECRET").expect("JWT_SECRET not set"));

pub static COOKIE_KEY_SECRET: LazyLock<String> =
    LazyLock::new(|| std::env::var("COOKIE_KEY_SECRET").expect("COOKIE_KEY_SECRET is not set"));

// DB modules
pub mod models;
pub mod schema;

// Web modules
pub mod routes;

pub mod jwt;
pub mod otp;
pub mod utils;

pub mod middlewares;

// tests
#[cfg(test)]
pub mod tests;

/// Main state is wrapped in another struct to for PrivateCookieJar
/// [Info](https://docs.rs/axum-extra/latest/axum_extra/extract/cookie/struct.PrivateCookieJar.html)
#[derive(Clone)]
pub struct AppState(Arc<InnerState>);

impl AppState {
    pub fn new() -> Self {
        AppState(Arc::new(InnerState {
            key: Key::from(COOKIE_KEY_SECRET.as_bytes()),
            pool: Arc::new(get_connection_pool()),
            otp_map: Mutex::new(HashMap::new()),
        }))
    }
}

impl Deref for AppState {
    type Target = InnerState;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl FromRef<AppState> for Key {
    fn from_ref(state: &AppState) -> Self {
        state.0.key.clone()
    }
}

pub struct InnerState {
    pub pool: Arc<Pool<ConnectionManager<PgConnection>>>,
    pub key: Key,
    pub otp_map: Mutex<HashMap<String, OTP>>,
}

pub fn establish_connection() -> PgConnection {
    dotenv().ok();

    PgConnection::establish(&DATABASE_URL)
        .unwrap_or_else(|_| panic!("ERROR: connecting to {}", *DATABASE_URL))
}

pub fn get_connection_pool() -> Pool<ConnectionManager<PgConnection>> {
    let manager = ConnectionManager::<PgConnection>::new(DATABASE_URL.to_string());

    Pool::builder()
        .test_on_check_out(true)
        .max_size(20)
        .build(manager)
        .expect("Could not build connection pool")
}

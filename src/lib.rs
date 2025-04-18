#![allow(dead_code)]

use std::{
    collections::HashMap,
    ops::Deref,
    sync::{Arc, LazyLock},
};

use axum::extract::FromRef;
use axum_extra::extract::cookie::Key;
use lettre::{AsyncSmtpTransport, Tokio1Executor, transport::smtp::authentication::Credentials};
use otp::OTP;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use tokio::sync::Mutex;

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

pub static PROD: LazyLock<bool> = LazyLock::new(|| {
    std::env::var("PROD")
        .unwrap_or("1".into())
        .parse::<i32>()
        .expect("unable to parse to i32")
        != 0
});

static SMTP_EMAIL_USERNAME: LazyLock<String> =
    LazyLock::new(|| std::env::var("SMTP_EMAIL_USERNAME").expect("SMTP_EMAIL_USERNAME is not set"));

static SMTP_EMAIL_PASSWORD: LazyLock<String> =
    LazyLock::new(|| std::env::var("SMTP_EMAIL_PASSWORD").expect("SMTP_EMAIL_PASSWORD is not set"));

static SMTP_EMAIL_RELAY: LazyLock<String> =
    LazyLock::new(|| std::env::var("SMTP_EMAIL_RELAY").expect("SMTP_EMAIL_RELAY is not set"));

// DB modules
pub mod db;
pub mod models;

// Web modules
pub mod routes;

pub mod handlers;
pub mod jwt;
pub mod otp;
pub mod utils;

pub mod middlewares;

// tests
#[cfg(test)]
pub mod tests;

pub mod sql;

/// Main state is wrapped in another struct to for PrivateCookieJar
/// [Info](https://docs.rs/axum-extra/latest/axum_extra/extract/cookie/struct.PrivateCookieJar.html)
#[derive(Clone)]
pub struct AppState(Arc<InnerState>);

impl AppState {
    pub fn new(pool: Pool<Postgres>) -> Self {
        let creds = Credentials::new(
            SMTP_EMAIL_USERNAME.to_owned(),
            SMTP_EMAIL_PASSWORD.to_owned(),
        );

        // on production use the set email relay(probably gmail, outlook, etc) or local test environment
        let mailer: AsyncSmtpTransport<Tokio1Executor> = if *PROD {
            AsyncSmtpTransport::<Tokio1Executor>::relay(&SMTP_EMAIL_RELAY)
                .map_err(|err| {
                    tracing::error!("setting relay for transport: {}, {err}", *SMTP_EMAIL_RELAY)
                })
                .unwrap()
                .credentials(creds)
                .build()
        } else {
            AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous("127.0.0.1".to_string())
                .port(1025)
                .build()
        };
        AppState(Arc::new(InnerState {
            key: Key::from(COOKIE_KEY_SECRET.as_bytes()),
            pool,
            otp_map: Mutex::new(HashMap::new()),
            mailer,
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
    pub pool: Pool<Postgres>,
    pub key: Key,
    pub otp_map: Mutex<HashMap<String, OTP>>,
    pub mailer: AsyncSmtpTransport<Tokio1Executor>,
}

pub async fn get_connection_pool() -> Pool<Postgres> {
    let pool = PgPoolOptions::new()
        .max_connections(100)
        .connect(&DATABASE_URL)
        .await;

    match pool {
        Ok(pool) => pool,
        Err(err) => {
            tracing::error!("{err}");
            panic!("Error getting pool")
        }
    }
}

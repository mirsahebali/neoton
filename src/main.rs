#![allow(dead_code)]

use axum::{
    Json, Router,
    http::{Method, StatusCode},
    middleware::from_fn_with_state,
    response::IntoResponse,
    routing::{delete, get, post},
};
use clap::Parser;
use neoton::{
    AppState, PROD, get_connection_pool, get_valkey_conn,
    handlers::{
        calls::{create_video_call, hangup_video_call, join_video_call},
        messaging::send_message,
        realtime::{accept_user_invite, invite_user},
    },
    middlewares::auth::ensure_authenticated,
    routes::{
        ReturningResponse,
        auth::{
            login::login_handler, logout::logout_user, register::register_handler,
            verify::verify_otp,
        },
        user::info::*,
    },
};
use serde::Serialize;

use socketioxide::{ParserConfig, extract::SocketRef};
use tower_http::{
    cors::CorsLayer,
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

#[derive(Parser, Debug)]
pub struct RunArgs {
    #[arg(short, long, default_value_t = 8080)]
    port: u16,

    /// postgres database url
    #[arg(short, long)]
    database_url: String,
}

use tracing_subscriber::{layer::SubscriberExt, registry, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=debug", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_file(true)
                .with_line_number(true),
        )
        .init();

    dotenvy::dotenv()?;

    let app_state = AppState::new(get_connection_pool().await, get_valkey_conn().await);

    let (socket_io_layer, io) = socketioxide::SocketIo::builder()
        .with_parser(ParserConfig::msgpack())
        .with_state(app_state.clone())
        .build_layer();

    tracing::info!("Starting Main execution");

    sqlx::migrate!("./migrations").run(&app_state.pool).await?;

    // invitations namespace
    io.ns("/invitation", |s: SocketRef| {
        let _ = s.emit("connection", "server connection established");

        s.on("user:invite", invite_user);
        s.on("user:accept", accept_user_invite);
    });

    io.ns("/message", |s: SocketRef| {
        tracing::info!("messaging socket connected");
        s.on("message:send", send_message);
    });

    io.ns("/call", |s: SocketRef| {
        tracing::info!("Calling socket connected");
        s.on("invite:video", create_video_call);
        s.on("join:video", join_video_call);
        s.on("hangup:video", hangup_video_call)
    });

    let db_router = Router::new()
        .route("/user", get(get_user))
        .route("/health", get(async || "Should only get on valid token"))
        .route("/user/chats", get(get_conversations))
        .route("/user/contacts", get(get_contacts))
        .route("/user/requests", get(get_requests))
        .route("/user/invites", get(get_invites))
        .route("/user/messages/{username}", get(get_messages))
        .route_layer(from_fn_with_state(app_state.clone(), ensure_authenticated));

    // api router
    let api_router = Router::new()
        .nest("/db", db_router)
        .route("/health", get(check_health))
        .route("/auth/register", post(register_handler))
        .route("/auth/login", post(login_handler))
        .route("/auth/verify", post(verify_otp))
        .route("/auth/logout", delete(logout_user));

    let app = Router::new()
        .nest("/api", api_router)
        // Service to serve our solidjs web file
        .fallback_service(ServeDir::new("web/dist").fallback(ServeFile::new("web/dist/index.html")))
        .layer(socket_io_layer)
        .layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_origin([
                    "https://localhost:5173".parse().unwrap(),
                    "https://neoton.saheb.me".parse().unwrap(),
                    "https://neoton.space".parse().unwrap(),
                ])
                .allow_methods([
                    Method::GET,
                    Method::POST,
                    Method::PUT,
                    Method::PATCH,
                    Method::DELETE,
                ])
                .allow_credentials(!*PROD),
        )
        .with_state(app_state.clone());

    // run our app with hyper, listening globally on port 8080
    tracing::info!("Binding to TCP");
    tracing::info!(
        "Running in {}",
        if *PROD { "Production" } else { "Development" }
    );
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    tracing::info!("Booting server");
    axum::serve(listener, app).await?;
    Ok(())
}

#[derive(Serialize)]
struct Tmp {
    val1: i32,
    val2: String,
}
#[derive(Serialize)]
enum Resp {
    Foo(Tmp),
}

async fn check_health() -> impl IntoResponse {
    Json(ReturningResponse {
        enabled_2fa: false,
        error: false,
        message: "Your outie likes rust".into(),
        status: StatusCode::OK.as_u16(),
        data: None,
    })
}

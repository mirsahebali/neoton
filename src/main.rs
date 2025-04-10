#![allow(dead_code)]

use axum::{
    Json, Router,
    http::StatusCode,
    middleware::from_fn_with_state,
    response::IntoResponse,
    routing::{delete, get, post},
};
use neolink::{
    AppState,
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

use tower_http::{
    cors::CorsLayer,
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, registry, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=debug", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let app_state = AppState::new();

    let db_router = Router::new()
        .route("/user", get(get_user))
        .route("/health", get(async || "Should only get on correct token"))
        .route("/user/contacts", get(get_contacts))
        .route("/user/requests", get(get_requests))
        .route("/user/invites", get(get_invites))
        .route_layer(from_fn_with_state(app_state.clone(), ensure_authenticated));

    // api router
    let api_router = Router::new()
        .route("/health", get(check_health))
        .route("/auth/register", post(register_handler))
        .route("/auth/login", post(login_handler))
        .route("/auth/verify", post(verify_otp))
        .route("/auth/logout", delete(logout_user))
        .nest("/db", db_router);

    let app = Router::new()
        .nest("/api", api_router)
        // Service to serve our solidjs web file
        .fallback_service(ServeDir::new("web/dist").fallback(ServeFile::new("web/dist/index.html")))
        .layer(TraceLayer::new_for_http())
        .layer(CorsLayer::new().allow_origin([
            "http://localhost:5173".parse().unwrap(),
            "https://neolink.saheb.me".parse().unwrap(),
        ]))
        .with_state(app_state);

    // run our app with hyper, listening globally on port 8080
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
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
        user_data: None,
    })
}

use crate::db::mutations::create_new_user;
use crate::routes::ReturningResponse;
use crate::routes::email::send_email_handler;
use crate::{AppState, otp::OTP};
use axum::{
    Json, debug_handler,
    extract::{Form, State},
    http::{self, StatusCode},
};
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};
use serde::{Deserialize, Serialize};
use sqlx::Error;
use sqlx::prelude::*;

use crate::{
    jwt::{UserClaims, encode_jwt},
    models::User,
};

#[derive(Serialize, Deserialize, Debug)]
pub struct UserRegisterInput {
    pub username: String,
    pub email: String,
    pub password: String,
    pub fullname: String,
    pub enable_2fa: bool,
}

#[derive(Serialize, Deserialize)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub hashed_password: String,
    pub enabled_2fa: bool,
    pub fullname: String,
}

#[derive(Deserialize, Serialize, FromRow, Debug)]
struct ReturningUserResult {
    email: String,
    username: String,
    id: i32,
}

#[debug_handler]
pub async fn register_handler(
    jar: PrivateCookieJar,
    State(app_state): State<AppState>,
    Form(input): Form<UserRegisterInput>,
) -> Result<
    (Option<PrivateCookieJar>, Json<ReturningResponse>),
    (StatusCode, Json<ReturningResponse>),
> {
    let conn = app_state.pool.clone();
    tracing::info!("Active Connections: {}", conn.size());
    let result: Result<User, Error> = create_new_user(
        &conn,
        input.email,
        input.username,
        input.password,
        input.fullname,
        input.enable_2fa,
    )
    .await;

    match result {
        Ok(user) => {
            tracing::info!("Created new user: \n{user:?}");
            if !input.enable_2fa {
                // empty token may indicate some kind of error
                let token = encode_jwt(UserClaims::new(&user));
                if token.is_empty() {
                    tracing::error!("error encoding jwt");
                    return Err((
                        http::StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ReturningResponse {
                            error: true,
                            message: "Internal server error".into(),
                            status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                            user_data: None,
                            enabled_2fa: false,
                        }),
                    ));
                }

                let updated_jar = jar.add(Cookie::build(("ACCESS_TOKEN", token)).path("/"));

                tracing::info!("Successfully sent cookie to user: {}", user.email);

                return Ok((
                    Some(updated_jar),
                    Json(ReturningResponse {
                        error: false,
                        message: "User created".into(),
                        status: StatusCode::OK.as_u16(),
                        user_data: Some(user),
                        enabled_2fa: false,
                    }),
                ));
            }

            let otp = OTP::new();

            if let Err(err) = send_email_handler(&user.username, &user.email, &otp.token).await {
                tracing::error!("ERROR sending email to {}", &user.email);
                tracing::error!("{err}");
                return Err((
                    http::StatusCode::BAD_REQUEST,
                    Json(ReturningResponse {
                        error: true,
                        message: "Error sending email".into(),
                        status: StatusCode::BAD_REQUEST.as_u16(),
                        user_data: None,
                        enabled_2fa: false,
                    }),
                ));
            }

            app_state
                .otp_map
                .lock()
                .await
                .insert(user.email.clone(), otp);

            tracing::info!("Email sent to user: {} Successfully", &user.email);

            Ok((
                None,
                Json(ReturningResponse {
                    error: false,
                    message: "OTP sent to user email".into(),
                    status: StatusCode::OK.as_u16(),
                    user_data: None,
                    enabled_2fa: true,
                }),
            ))
        }
        Err(err) => {
            tracing::error!("ERROR: inserting new user data");
            tracing::error!("{err}");
            Err((
                http::StatusCode::INTERNAL_SERVER_ERROR,
                Json(ReturningResponse {
                    error: true,
                    message: "Internal server error".into(),
                    status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                    user_data: None,
                    enabled_2fa: false,
                }),
            ))
        }
    }
}

pub async fn check_jwt() {}

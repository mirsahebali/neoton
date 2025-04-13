use axum::{Form, Json, debug_handler, extract::State, http::StatusCode};
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};

use serde::Deserialize;

use crate::{
    AppState,
    db::queries::get_one_user_by_email,
    jwt::{UserClaims, encode_jwt},
    models::User,
    otp::OTP,
    routes::email::send_email_handler,
    utils::verify_password,
};

use crate::routes::ReturningResponse;

#[derive(Deserialize, Debug)]
pub struct UserLoginInput {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[debug_handler]
pub async fn login_handler(
    jar: PrivateCookieJar,
    State(app_state): State<AppState>,
    Form(input): Form<UserLoginInput>,
) -> Result<
    (Option<PrivateCookieJar>, Json<ReturningResponse>),
    (StatusCode, Json<ReturningResponse>),
> {
    let conn = app_state.pool.clone();
    let user: Result<User, sqlx::Error> = get_one_user_by_email(&conn, input.email).await;
    match user {
        Ok(user) => {
            tracing::info!("Logging in user: {user:?}");

            if !verify_password(input.password, user.hashed_password.clone()) {
                tracing::error!("Invalid password entered by user: {user:?}");
                return Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ReturningResponse {
                        error: true,
                        message: "Invalid Credentials".into(),
                        status: StatusCode::BAD_REQUEST.as_u16(),
                        user_data: None,
                        enabled_2fa: false,
                    }),
                ));
            }

            if !user.enabled_2fa {
                // empty token may indicate some kind of error
                let token = encode_jwt(UserClaims::new(&user));

                if token.is_empty() {
                    tracing::error!("error encoding jwt");
                    return Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(ReturningResponse {
                            error: true,
                            message: "Internal server error".into(),
                            status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                            user_data: None,
                            enabled_2fa: false,
                        }),
                    ));
                }

                let mut user = user;
                user.hashed_password = "[REDACTED]".into();

                let updated_jar = jar.add(Cookie::build(("ACCESS_TOKEN", token)).path("/"));

                tracing::info!("Successfully sent cookie to user: {}", user.email);

                return Ok((
                    Some(updated_jar),
                    Json(ReturningResponse {
                        error: false,
                        message: "Logged in".into(),
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
                    StatusCode::BAD_REQUEST,
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
            tracing::error!("ERROR: getting user data");
            tracing::error!("{err}");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
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

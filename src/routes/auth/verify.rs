use axum::{Form, Json, debug_handler, extract::State, http::StatusCode};
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};
use serde::Deserialize;

use crate::{
    AppState,
    db::queries::get_one_user_by_email,
    jwt::{UserClaims, encode_jwt},
    models::User,
};

#[derive(Deserialize, Debug)]
pub struct UserVerifyInput {
    pub email: String,
    pub token: u16,
}

use crate::routes::ReturningResponse;

#[debug_handler]
pub async fn verify_otp(
    jar: PrivateCookieJar,
    State(app_state): State<AppState>,
    Form(input): Form<UserVerifyInput>,
) -> Result<
    (Option<PrivateCookieJar>, Json<ReturningResponse>),
    (StatusCode, Json<ReturningResponse>),
> {
    let otp_map = app_state.otp_map.lock().await;

    let curr_token = otp_map.get(&input.email);

    match curr_token {
        Some(token) => {
            if !token.is_valid(input.token) {
                tracing::error!("Invalid token entered by user: {input:?}");
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ReturningResponse {
                        error: true,
                        message: "Invalid token".into(),
                        enabled_2fa: false,
                        status: StatusCode::UNAUTHORIZED.as_u16(),
                        user_data: None,
                    }),
                ));
            }
            let conn = app_state.pool.clone();
            let user: Result<User, sqlx::Error> = get_one_user_by_email(&conn, input.email).await;

            match user {
                Ok(user) => {
                    let token = encode_jwt(UserClaims::new(&user));
                    if token.is_empty() {
                        tracing::error!("encoding jwt: {user:?}");
                        return Err((
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ReturningResponse {
                                enabled_2fa: false,
                                error: true,
                                status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                                message: "Internal Server Error".into(),
                                user_data: None,
                            }),
                        ));
                    }

                    let updated_jar = jar.add(Cookie::new("ACCESS_TOKEN", token));

                    tracing::info!("successfully verified user and sent token to {user:?}");

                    Ok((
                        Some(updated_jar),
                        Json(ReturningResponse {
                            enabled_2fa: true,
                            error: false,
                            status: StatusCode::OK.as_u16(),
                            message: "Verified user successfully".into(),
                            user_data: Some(user),
                        }),
                    ))
                }
                Err(err) => {
                    tracing::error!("getting user: {err}");
                    Err((
                        StatusCode::NOT_FOUND,
                        Json(ReturningResponse {
                            enabled_2fa: false,
                            error: true,
                            status: StatusCode::NOT_FOUND.as_u16(),
                            message: "Error getting user".into(),
                            user_data: None,
                        }),
                    ))
                }
            }
        }
        None => {
            tracing::error!("otp not found for user {input:?}");
            Err((
                StatusCode::NOT_FOUND,
                Json(ReturningResponse {
                    enabled_2fa: false,
                    error: true,
                    status: StatusCode::NOT_FOUND.as_u16(),
                    message: "Invalid Token".into(),
                    user_data: None,
                }),
            ))
        }
    }
}

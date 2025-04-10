use crate::routes::ReturningResponse;
use crate::routes::email::send_email_handler;
use crate::{AppState, otp::OTP};
use axum::{
    Json, debug_handler,
    extract::{Form, State},
    http::{self, StatusCode},
};
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};
use diesel::{RunQueryDsl, SelectableHelper, prelude::Insertable};
use serde::Deserialize;

use crate::{
    jwt::{UserClaims, encode_jwt},
    models::User,
    schema::users,
    utils::hash_password,
};

#[derive(Deserialize, Debug)]
pub struct UserRegisterInput {
    pub username: String,
    pub email: String,
    pub password: String,
    pub fullname: String,
    pub enable_2fa: bool,
}

#[derive(Insertable)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub username: String,
    pub email: String,
    pub hashed_password: String,
    pub enabled_2fa: bool,
    pub fullname: String,
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
    let new_user = NewUser {
        username: input.username,
        email: input.email,
        hashed_password: hash_password(input.password),
        enabled_2fa: input.enable_2fa,
        fullname: input.fullname,
    };

    let mut conn = app_state.pool.get();
    match &mut conn {
        Ok(conn) => {
            let result = diesel::insert_into(users::table)
                .values(&new_user)
                .returning(User::as_returning())
                .get_result(conn);

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

                        let mut user = user;
                        user.hashed_password = "[REDACTED]".into();

                        let updated_jar = jar.add(Cookie::new("ACCESS_TOKEN", token));

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

                    if let Err(err) =
                        send_email_handler(&user.username, &user.email, &otp.token).await
                    {
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
                        .map_err(|err| {
                            tracing::error!("error locking mutex in the thread, {err}");
                        })
                        .unwrap()
                        .insert(user.email.clone(), otp);

                    tracing::info!("Email sent to user: {} Successfully", &user.email);

                    return Ok((
                        None,
                        Json(ReturningResponse {
                            error: false,
                            message: "OTP sent to user email".into(),
                            status: StatusCode::OK.as_u16(),
                            user_data: None,
                            enabled_2fa: true,
                        }),
                    ));
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
        Err(err) => {
            tracing::error!("ERROR: inserting to database: Pool ERROR");
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

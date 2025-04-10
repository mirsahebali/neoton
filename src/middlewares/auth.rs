use axum::{
    Json, debug_middleware,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};

use diesel::{prelude::*, result::Error};

use crate::{AppState, jwt::decode_jwt, models::User, routes::ReturningResponse, schema::users};

#[debug_middleware]
pub async fn ensure_authenticated(
    jar: PrivateCookieJar,
    State(app_state): State<AppState>,
    req: Request,
    next: Next,
) -> Result<Response, (StatusCode, PrivateCookieJar, Json<ReturningResponse>)> {
    let token = jar.get("ACCESS_TOKEN");

    let removed_access_token_jar = jar.remove(Cookie::from("ACCESS_TOKEN"));

    match token {
        Some(token) => {
            let claims = decode_jwt(token.to_string());

            match claims {
                Some(user_claim) => {
                    if user_claim.is_expired() {
                        tracing::error!("Getting expired token");

                        return Err((
                            StatusCode::UNAUTHORIZED,
                            removed_access_token_jar,
                            Json(ReturningResponse {
                                enabled_2fa: false,
                                error: true,
                                message: "Expired Session".into(),
                                status: StatusCode::UNAUTHORIZED.as_u16(),
                                user_data: None,
                            }),
                        ));
                    }

                    let mut conn = app_state.pool.get();
                    match &mut conn {
                        Ok(conn) => {
                            tracing::info!("Successfully getting connection");
                            let user: Result<User, Error> = users::table
                                .filter(users::email.eq(user_claim.email))
                                .select(User::as_select())
                                .limit(1)
                                .get_result(conn);
                            if let Err(err) = user {
                                tracing::error!("getting user from the database");
                                tracing::error!("{err}");
                                return Err((
                                    StatusCode::NOT_FOUND,
                                    removed_access_token_jar,
                                    Json(ReturningResponse {
                                        enabled_2fa: false,
                                        error: true,
                                        message: "User not found".into(),
                                        status: StatusCode::NOT_FOUND.as_u16(),
                                        user_data: None,
                                    }),
                                ));
                            }
                        }
                        Err(err) => {
                            tracing::error!("getting connection to the database");
                            tracing::error!("{err}");
                            return Err((
                                StatusCode::INTERNAL_SERVER_ERROR,
                                removed_access_token_jar,
                                Json(ReturningResponse {
                                    enabled_2fa: false,
                                    error: true,
                                    message: "Internal server error".into(),
                                    status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                                    user_data: None,
                                }),
                            ));
                        }
                    }

                    tracing::info!("Authorized user to next middleware from auth");

                    Ok(next.run(req).await)
                }
                None => {
                    tracing::error!("ERROR decoding claims");
                    Err((
                        StatusCode::UNAUTHORIZED,
                        removed_access_token_jar,
                        Json(ReturningResponse {
                            enabled_2fa: false,
                            error: true,
                            message: "UNAUTHORIZED user".into(),
                            status: StatusCode::UNAUTHORIZED.as_u16(),
                            user_data: None,
                        }),
                    ))
                }
            }
        }
        None => {
            tracing::error!("Missing access token");
            Err((
                StatusCode::UNAUTHORIZED,
                removed_access_token_jar,
                Json(ReturningResponse {
                    enabled_2fa: false,
                    error: true,
                    message: "UNAUTHORIZED user".into(),
                    status: StatusCode::UNAUTHORIZED.as_u16(),
                    user_data: None,
                }),
            ))
        }
    }
}

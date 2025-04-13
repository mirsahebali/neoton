use axum::{
    Json, debug_middleware,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};

use serde::Deserialize;
use serde::Serialize;

use crate::{
    AppState, db::queries::get_one_user_by_email, jwt::decode_jwt, routes::ReturningResponse,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CurrentUserLocal {
    pub email: String,
    pub id: i32,
    pub username: String,
}

#[debug_middleware]
pub async fn ensure_authenticated(
    jar: PrivateCookieJar,
    State(app_state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, (StatusCode, PrivateCookieJar, Json<ReturningResponse>)> {
    let token = jar.get("ACCESS_TOKEN");

    match token {
        Some(token) => {
            tracing::info!("Cookie path: {:?}", token.path());
            let claims = decode_jwt(token.value().to_string());
            let removed_access_token_jar = jar.remove(Cookie::from("ACCESS_TOKEN"));

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

                    let conn = app_state.pool.clone();
                    tracing::info!("Active Connections: {}", conn.size());
                    let user = get_one_user_by_email(&conn, user_claim.email).await;
                    match user {
                        Ok(user) => {
                            tracing::info!("Authorized user to next middleware from auth");

                            req.extensions_mut().insert(CurrentUserLocal {
                                username: user.username,
                                id: user.id,
                                email: user.email,
                            });
                            Ok(next.run(req).await)
                        }
                        Err(err) => {
                            tracing::error!("getting user from the database");
                            tracing::error!("{err}");
                            Err((
                                StatusCode::NOT_FOUND,
                                removed_access_token_jar,
                                Json(ReturningResponse {
                                    enabled_2fa: false,
                                    error: true,
                                    message: "User not found".into(),
                                    status: StatusCode::NOT_FOUND.as_u16(),
                                    user_data: None,
                                }),
                            ))
                        }
                    }
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
                jar,
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

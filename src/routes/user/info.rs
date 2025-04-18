use axum::{Extension, Json, debug_handler, extract::State, http::StatusCode};

use crate::{
    AppState,
    db::queries::{get_user_contacts, get_user_conversations, get_user_invites, get_user_requests},
    middlewares::auth::CurrentUserLocal,
    models::User,
    routes::ReturningResponse,
};

#[debug_handler]
pub async fn get_user(
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<User>, Json<ReturningResponse>> {
    let user = sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE email = $1",
        current_user_local.email
    )
    .fetch_one(&app_state.pool.clone())
    .await;
    match user {
        Ok(user) => Ok(Json(user)),
        Err(err) => {
            tracing::error!("getting user with email: {}", current_user_local.email);
            tracing::error!("{err}");
            Err(Json(ReturningResponse {
                error: true,
                message: "error getting user".into(),
                status: StatusCode::NOT_FOUND.as_u16(),
                data: None,
                enabled_2fa: false,
            }))
        }
    }
}
#[debug_handler]
pub async fn get_contacts(
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<Vec<User>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let contacts = get_user_contacts(&conn, current_user_local.id).await;
    match contacts {
        Ok(contacts) => Ok(Json(contacts)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("contacts not found");
                tracing::error!("{err}");
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::NOT_FOUND.as_u16(),
                        message: "contacts not found".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            } else {
                tracing::error!("error getting contacts from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                        message: "Internal server error".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            }
        }
    }
}
#[debug_handler]
pub async fn get_invites(
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<Vec<User>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let contacts = get_user_invites(&conn, current_user_local.id).await;

    match contacts {
        Ok(contacts) => Ok(Json(contacts)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("invites not found");
                tracing::error!("{err}");
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::NOT_FOUND.as_u16(),
                        message: "contacts not found".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            } else {
                tracing::error!("error getting contacts from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                        message: "Internal server error".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            }
        }
    }
}
#[debug_handler]
pub async fn get_requests(
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<Vec<User>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let contacts = get_user_requests(&conn, current_user_local.id).await;

    match contacts {
        Ok(contacts) => Ok(Json(contacts)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("requests not found");
                tracing::error!("{err}");
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::NOT_FOUND.as_u16(),
                        message: "contacts not found".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            } else {
                tracing::error!("error getting contacts from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                        message: "Internal server error".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            }
        }
    }
}

#[debug_handler]
pub async fn get_conversations(
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<Vec<User>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let conversations = get_user_conversations(&conn, current_user_local.id).await;

    match conversations {
        Ok(conversations) => Ok(Json(conversations)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("requests not found");
                tracing::error!("{err}");
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::NOT_FOUND.as_u16(),
                        message: "no conversations not found".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            } else {
                tracing::error!("error getting contacts from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                        message: "Internal server error".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            }
        }
    }
}

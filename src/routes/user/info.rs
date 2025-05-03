use axum::{
    Extension, Json, debug_handler,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    db::queries::{
        SelectUser, get_messages_db, get_one_user_by_username, get_user_contacts,
        get_user_conversations, get_user_invites, get_user_requests,
    },
    middlewares::auth::CurrentUserLocal,
    models::{Message, User},
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
) -> Result<Json<Vec<SelectUser>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let contacts = get_user_contacts(&conn, current_user_local.id).await;
    match contacts {
        Ok(contacts) => Ok(Json(contacts)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("contacts not found");
                tracing::error!("{err}");
                Ok(Json(Vec::new()))
            } else {
                tracing::error!("error getting contacts from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
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
) -> Result<Json<Vec<SelectUser>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let invites = get_user_invites(&conn, current_user_local.id).await;

    match invites {
        Ok(invites) => Ok(Json(invites)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("invites not found");
                tracing::error!("{err}");
                Ok(Json(Vec::new()))
            } else {
                tracing::error!("error getting invites from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
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
) -> Result<Json<Vec<SelectUser>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let requests = get_user_requests(&conn, current_user_local.id).await;

    match requests {
        Ok(requests) => Ok(Json(requests)),
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("requests not found");
                tracing::error!("{err}");
                Ok(Json(Vec::new()))
            } else {
                tracing::error!("error getting requests from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
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
                tracing::error!("conversations not found");
                tracing::error!("{err}");
                Ok(Json(Vec::new()))
            } else {
                tracing::error!("error getting conversations from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
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

pub async fn get_messages(
    Path(username): Path<String>,
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<Vec<Message>>, (StatusCode, Json<ReturningResponse>)> {
    let conn = app_state.pool.clone();
    let user = get_one_user_by_username(&conn, &username).await;
    match user {
        Ok(user) => {
            let messages = get_messages_db(&conn, user.id, current_user_local.id).await;
            match messages {
                Ok(messages) => Ok(Json(messages)),
                Err(err) => {
                    tracing::error!("error getting messages of user: {} from db", &user.username);
                    tracing::error!("{err}");
                    Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
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
        Err(err) => {
            if let sqlx::error::Error::RowNotFound = err {
                tracing::error!("user not found");
                tracing::error!("{err}");
                Err((
                    StatusCode::NOT_FOUND,
                    Json(ReturningResponse {
                        error: true,
                        status: StatusCode::NOT_FOUND.as_u16(),
                        message: "User not found".to_string(),
                        data: None,
                        enabled_2fa: false,
                    }),
                ))
            } else {
                tracing::error!("error getting conversations from db");
                tracing::error!("{err}");
                Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
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

use axum::{Extension, Json, debug_handler, extract::State, http::StatusCode};
use diesel::{prelude::*, result::Error};
use tower_http::follow_redirect::policy::PolicyExt;

use crate::{
    AppState,
    middlewares::auth::CurrentUserLocal,
    models::{Contact, SenderUser, User, UsersContacts},
    routes::ReturningResponse,
    schema::{contacts, users},
};

pub async fn get_user() {}
#[debug_handler]
pub async fn get_contacts(
    State(app_state): State<AppState>,
    current_user_local: Extension<CurrentUserLocal>,
) -> Result<Json<Contact>, (StatusCode, Json<ReturningResponse>)> {
    let mut conn = app_state.pool.get();
    match &mut conn {
        Ok(conn) => {
            let contacts = users::table
                .inner_join(contacts::table.on(contacts::recv_id.eq(Some(users::id))))
                .select(User::as_select())
                .load(conn);

            match contacts {
                Ok(contacts) => {
                    todo!()
                }
                Err(err) => {
                    if let diesel::result::Error::NotFound = err {
                        tracing::error!("contacts not found");
                        tracing::error!("{err}");
                        Err((
                            StatusCode::NOT_FOUND,
                            Json(ReturningResponse {
                                error: true,
                                status: StatusCode::NOT_FOUND.as_u16(),
                                message: "contacts not found".to_string(),
                                user_data: None,
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
                                user_data: None,
                                enabled_2fa: false,
                            }),
                        ))
                    }
                }
            }
        }
        Err(err) => {
            tracing::error!("error getting database connection, {err}");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ReturningResponse {
                    error: true,
                    enabled_2fa: false,
                    user_data: None,
                    message: "Internal server error".into(),
                    status: StatusCode::INTERNAL_SERVER_ERROR.as_u16(),
                }),
            ))
        }
    }
}
pub async fn get_invites() {}
pub async fn get_requests() {}

use axum::http::StatusCode;
use axum_extra::extract::{PrivateCookieJar, cookie::Cookie};

pub async fn logout_user(jar: PrivateCookieJar) -> (StatusCode, PrivateCookieJar) {
    let updated_jar = jar.remove(Cookie::from("ACCESS_TOKEN"));

    // TODO: check which user is logging out
    tracing::info!("User logging out");

    (StatusCode::OK, updated_jar)
}

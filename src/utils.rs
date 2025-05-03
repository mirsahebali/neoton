use crate::SALT_ROUNDS;
use bcrypt::{hash, verify};
use cookie::time::{Duration, OffsetDateTime};

pub fn hash_password(password: String) -> String {
    let hashed_password = hash(password, *SALT_ROUNDS);

    match hashed_password {
        Ok(hashed_password) => hashed_password,
        Err(err) => {
            tracing::error!("ERROR: hashing password");
            tracing::error!("{err}");
            String::new()
        }
    }
}

pub fn verify_password(password: String, hashed_password: String) -> bool {
    verify(password, &hashed_password).unwrap_or_default()
}

/// Current time in unix nano seconds
pub fn time_now_ns() -> i128 {
    OffsetDateTime::now_utc().unix_timestamp_nanos()
}

pub fn time_now_ms_with_exp(exp_duration: Duration) -> i128 {
    let offset_now_time = OffsetDateTime::now_utc();
    let exp = offset_now_time.saturating_add(exp_duration);
    exp.unix_timestamp_nanos()
}

/// Returns the current unix time with 7 day expiration offset in nanoseconds
pub fn time_now_ms_with_7_day_exp() -> (i128, i128) {
    let offset_now_time = OffsetDateTime::now_utc();
    let now_time_ns = offset_now_time.unix_timestamp_nanos();
    let exp = offset_now_time.saturating_add(Duration::days(7));
    let exp_time_ns = exp.unix_timestamp_nanos();
    (now_time_ns, exp_time_ns)
}

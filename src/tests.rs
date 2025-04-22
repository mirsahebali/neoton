use cookie::time::{Duration, OffsetDateTime};
use lettre::{AsyncSmtpTransport, Tokio1Executor, transport::smtp::authentication::Credentials};
use serde_json::Value;

use crate::{
    PROD, SMTP_EMAIL_PASSWORD, SMTP_EMAIL_RELAY, SMTP_EMAIL_USERNAME,
    handlers::realtime::{InviteUserData, SenderData},
    jwt::{UserClaims, decode_jwt, encode_jwt},
    models::User,
    routes::email::send_email_handler,
    utils::{time_now_ns, verify_password},
};

#[test]
fn test_hash_password() {
    assert!(verify_password(
        "password".into(),
        "$2b$10$4TRQGoQPB08iZg/AgJnIOOYVXsZRcRQp3JMN3s/e/5RGWL5IHcYA6".into()
    ));
}

#[tokio::test]
async fn test_email_sending() {
    dotenvy::dotenv().unwrap();
    let creds = Credentials::new(
        SMTP_EMAIL_USERNAME.to_owned(),
        SMTP_EMAIL_PASSWORD.to_owned(),
    );

    let mailer: AsyncSmtpTransport<Tokio1Executor> = if *PROD {
        AsyncSmtpTransport::<Tokio1Executor>::relay(&SMTP_EMAIL_RELAY)
            .map_err(|err| {
                tracing::error!("setting relay for transport: {}, {err}", *SMTP_EMAIL_RELAY)
            })
            .unwrap()
            .credentials(creds)
            .build()
    } else {
        AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous("127.0.0.1".to_string())
            .port(1025)
            .build()
    };

    assert!(
        send_email_handler(
            mailer,
            &"fooname".to_string(),
            &"podiji4845@mobilesm.com".to_string(),
            &55555
        )
        .await
        .is_ok()
    )
}

#[test]
pub fn jwt_encode_decode_exp() {
    dotenvy::dotenv().unwrap();
    let mut user_claims = UserClaims::new(&User::default());
    let time_now = time_now_ns();

    let exp_time = time_now + 604800000;
    user_claims.iat = time_now;
    user_claims.exp = exp_time;
    let token = encode_jwt(user_claims.clone());
    assert!(!token.is_empty());

    let claims = decode_jwt(token);
    assert!(&claims.is_some());
    assert_eq!(claims.as_ref().unwrap(), &user_claims);

    assert!(!claims.as_ref().unwrap().is_expired());
    dbg!(claims.as_ref().unwrap());
    dbg!(time_now);
}

#[test]
fn test_date_time() {
    dbg!(OffsetDateTime::now_utc());
    dbg!(OffsetDateTime::now_utc().unix_timestamp_nanos());
    dbg!(OffsetDateTime::now_utc().saturating_add(Duration::days(7)));
    dbg!(OffsetDateTime::now_utc().saturating_add(Duration::days(7)));
}

#[test]
fn test_json_value() {
    let data = InviteUserData {
        sender: SenderData {
            username: "hello".to_string(),
            id: 10,
        },
        recv_username: "foo".to_string(),
    };
    let val = serde_json::json!(data);

    dbg!(&val["sender"]);
}

#[test]
fn db_join() {}

use lettre::{AsyncSmtpTransport, Tokio1Executor, transport::smtp::authentication::Credentials};

use crate::{
    PROD, SMTP_EMAIL_PASSWORD, SMTP_EMAIL_RELAY, SMTP_EMAIL_USERNAME,
    routes::email::send_email_handler, utils::verify_password,
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
fn db_join() {}

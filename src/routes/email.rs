use std::sync::LazyLock;

use lettre::{
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
    message::header::ContentType,
    transport::smtp::{Error, authentication::Credentials, response::Response},
};

static SMTP_EMAIL_USERNAME: LazyLock<String> =
    LazyLock::new(|| std::env::var("SMTP_EMAIL_USERNAME").expect("SMTP_EMAIL_USERNAME is not set"));

static SMTP_EMAIL_PASSWORD: LazyLock<String> =
    LazyLock::new(|| std::env::var("SMTP_EMAIL_PASSWORD").expect("SMTP_EMAIL_PASSWORD is not set"));

static SMTP_EMAIL_RELAY: LazyLock<String> =
    LazyLock::new(|| std::env::var("SMTP_EMAIL_RELAY").expect("SMTP_EMAIL_RELAY is not set"));

pub async fn send_email_handler(
    username: &String,
    email: &String,
    token: &u16,
) -> Result<Response, Error> {
    let email = Message::builder()
        .from("NeolinkTeam <mirsahebali204@gmail.com>".parse().unwrap())
        .to(format!("{username} <{email}>").parse().unwrap())
        .subject("Verification for Neolink")
        .header(ContentType::TEXT_HTML)
        .body(format!(
            r#"
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%;">

                    <h1 style="font-size: 24px; color: #333333; margin-bottom: 20px;">Verification Code for Neolink Auth</h1>

                    <div style="font-size: 18px; color: #333333; margin-bottom: 10px;">
                        <strong>Token:</strong> {token}
                    </div>

                    <div style="font-size: 16px; color: #666666;">
                        It will expire in 5 minutes.
                    </div>

                </div>
        "#
        ))
        .map_err(|err| tracing::error!("ERROR building the message, {err}"))
        .unwrap();

    let creds = Credentials::new(
        SMTP_EMAIL_USERNAME.to_owned(),
        SMTP_EMAIL_PASSWORD.to_owned(),
    );

    let mailer: AsyncSmtpTransport<Tokio1Executor> =
        AsyncSmtpTransport::<Tokio1Executor>::relay(&SMTP_EMAIL_RELAY)
            .map_err(|err| {
                tracing::error!("setting relay for transport: {}, {err}", *SMTP_EMAIL_RELAY)
            })
            .unwrap()
            .credentials(creds)
            .build();

    mailer.send(email).await
}

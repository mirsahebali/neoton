use lettre::{
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
    message::header::ContentType,
    transport::smtp::{Error, response::Response},
};

pub async fn send_email_handler(
    mailer: AsyncSmtpTransport<Tokio1Executor>,
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

    mailer.send(email).await
}

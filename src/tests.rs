use crate::{routes::email::send_email_handler, utils::verify_password};

#[test]
fn test_hash_password() {
    assert!(verify_password(
        "password".into(),
        "$2b$10$4TRQGoQPB08iZg/AgJnIOOYVXsZRcRQp3JMN3s/e/5RGWL5IHcYA6".into()
    ));
}

#[tokio::test]
async fn test_email_sending() {
    assert!(
        send_email_handler(
            &"fooname".to_string(),
            &"podiji4845@mobilesm.com".to_string(),
            &55555
        )
        .await
        .is_ok()
    )
}

pub const INSERT_NEW_USER_SQL: &str = r#"
    INSERT INTO users(email, username, hashed_password, fullname, enabled_2fa) values( $1, $2, $3, $4, $5) RETURNING * 
"#;

// @generated automatically by Diesel CLI.

diesel::table! {
    contacts (id) {
        id -> Int4,
        sender_id -> Nullable<Int4>,
        recv_id -> Nullable<Int4>,
        request_accepted -> Bool,
        sent_at -> Timestamptz,
    }
}

diesel::table! {
    messages (id) {
        id -> Int4,
        content -> Text,
        sender_id -> Int4,
        recv_id -> Int4,
        sent_at -> Timestamptz,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        #[max_length = 14]
        username -> Varchar,
        #[max_length = 40]
        fullname -> Varchar,
        profile_image -> Text,
        #[max_length = 70]
        email -> Varchar,
        hashed_password -> Text,
        is_verified -> Bool,
        enabled_2fa -> Bool,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    users_contacts (sender_id, recv_id) {
        sender_id -> Int4,
        recv_id -> Int4,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    contacts,
    messages,
    users,
    users_contacts,
);

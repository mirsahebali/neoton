#pragma once

#include "schema_auth.h"
#include <string>

using std::string;

const string CREATE_USER_TABLE =
    "CREATE TABLE IF NOT EXISTS users ("
    "username VARCHAR(100) NOT NULL UNIQUE, "
    "email VARCHAR(100) NOT NULL UNIQUE PRIMARY KEY, "
    "enabled_password BOOLEAN NOT NULL DEFAULT TRUE,  "
    "created_at REAL NOT NULL DEFAULT (unixepoch('now', 'subsec')), "
    "verified_at INT NOT NULL DEFAULT 0,"
    "hashed_password TEXT DEFAULT '' )";

const string INSERT_NEW_USER_DATA = "INSERT INTO users(id, "
                                    "username, "
                                    "email, "
                                    "enabled_password, "
                                    "hashed_password, "
                                    "created_at)"
                                    "VALUES( $1, $2, $3, $4, $5, $6)";

const string QUERY_USER_DATA = "SELECT * FROM users WHERE $1 = $2";

const string QUERY_USERS = "SELECT * FROM users";

const string UPDATE_USER_DATA_SINGLE =
    "UPDATE users SET $3 = $4 WHERE $1 = $2 LIMIT 1";

int insert_user_data(User *user);

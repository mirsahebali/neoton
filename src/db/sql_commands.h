#pragma once

#include "drogon/orm/DbClient.h"
#include <bits/types/error_t.h>
#include <optional>
#include <string>

using std::string;
using namespace drogon;

const string CREATE_USER_TABLE =
    "CREATE TABLE IF NOT EXISTS users("
    "username VARCHAR(100) NOT NULL UNIQUE,"
    "email VARCHAR(100) NOT NULL UNIQUUE PRIMARY KEY,"
    "enabled_password BOOLEAN NOT NULL DEFAULT TRUE,"
    "created_at INT NOT NULL DEFAULT datetime('now'),"
    "verified_at INT NOT NULL DEFAULT 0,"
    "hashed_password VARCHAR(100) DEFAULT '')";

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

std::optional<error_t> insert_user_data();

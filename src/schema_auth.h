#pragma once

#include "utils.h"
#include <string>

using string = std::string;
using u_long = unsigned long;
class User {
public:
  string username;
  string email;
  string hashed_password;
  u_long created_at;
  u_long verified_at;
  User(string email, string username, string hashed_password)
      : email(email), username(username), hashed_password(hashed_password) {
    created_at = get_current_time();
  }

  bool is_verified();
  bool verify_user();
};

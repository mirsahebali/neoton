#pragma once
#include "chats/chat.h"
#include "utils/utils.h"
#include <string>
#include <sys/types.h>
#include <vector>

using string = std::string;

class Chat;

class User {
public:
  string name;
  string email;
  string password;
  u_int64_t created_at;
  u_int64_t confirmed_at;
  u_int64_t updated_at;
  std::vector<Chat> chats;
  User(const string email, const string password, const string name)
      : email(email), password(password), name(name) {
    created_at = get_current_time();
    confirmed_at = 0;
    updated_at = 0;
  }

  void confirm_user();
};

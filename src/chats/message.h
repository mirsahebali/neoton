#pragma once

#include "chats/chat.h"
#include "utils/utils.h"
#include <string>
#include <sys/types.h>
class Chat;

class Message {

public:
  std::string text;
  long created_at;
  User *belongs_to;
  Chat *recipient;
  Message(const std::string text) : text(text) {
    created_at = get_current_time();
  }
};

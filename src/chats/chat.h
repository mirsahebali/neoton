#pragma once

#include "auth/users.h"
#include "chats/message.h"
#include <vector>

class User;
class Message;

class Chat {
public:
  const User *recipient;
  const User *belongs_to;
  std::vector<Message> messages;
  Chat(const User *recipient, const User *belongs_to)
      : recipient(recipient), belongs_to(belongs_to),
        messages(std::vector<Message>(0)) {
    messages = std::vector<Message>(0);
  }
};

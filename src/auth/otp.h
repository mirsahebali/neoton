#pragma once
#include "utils/utils.h"
#include <cstdlib>
#include <sys/types.h>

constexpr int EXP_MINUTES = 100 * 60 * 5;

class OTP {
public:
  const unsigned int token = random();
  const unsigned long created_at = get_current_time();
  OTP() {}

  bool is_expired() {
    return this->created_at + EXP_MINUTES <= get_current_time();
  }

  bool is_verified(const int token) { return this->token == token; }
};

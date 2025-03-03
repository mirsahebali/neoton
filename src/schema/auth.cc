#include "auth.h"

bool User::is_verified() { return verified_at != 0 || verified_at != -1; }

bool User::verify_user() {
  verified_at = get_current_time();
  return is_verified();
}

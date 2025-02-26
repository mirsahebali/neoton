#include "users.h"

void User::confirm_user() { this->confirmed_at = get_current_time(); }

#pragma once

#include <string>
inline std::string get_secret() { std::getenv("JWT_SECRET"); }

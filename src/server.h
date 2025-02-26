#pragma once
#include "auth/otp.h"

#include <map>
#include <string>

class Server {
public:
  std::map<std::string, OTP> otp_map;
  int port = 8080;
  Server() {}
};

void start_server();

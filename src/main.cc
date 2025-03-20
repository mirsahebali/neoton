#include "sql_commands.h"
#include "sqlite3.h"
#include <cstddef>
#include <cstring>
#include <iostream>
#include <memory>
#include <stdlib.h>

#include <spdlog/spdlog.h>

#include "db.h"

#include <drogon/HttpAppFramework.h>
#include <drogon/HttpFilter.h>
#include <drogon/HttpResponse.h>

#include <trantor/utils/Logger.h>

using namespace drogon;

using string = std::string;

static const char *PROD_HOST = std::getenv("PROD_HOST");

static const char *HOST =
    strcmp(PROD_HOST, "dev") ? "http://localhost:5173" : PROD_HOST;

class CorsFilter : public HttpFilter<CorsFilter, false> {
public:
  void doFilter(const HttpRequestPtr &req, FilterCallback &&filter_callback,
                FilterChainCallback &&filter_chain_callback) override {

    auto resp = HttpResponse::newHttpResponse();

    resp->addHeader("Access-Control-Allow-Origin", HOST);
    resp->addHeader("Access-Control-Allow-Methods",
                    "POST,PUT,DELETE,GET,OPTIONS");

    resp->addHeader("Access-Control-Allow-Headers",
                    "Content-Type, x-requested-with");
    filter_callback(resp);
  }
};

void check_env(const char *key, const char *val) {
  if (key == NULL) {
    spdlog::error("Environment variable {} not found", key);
    exit(1);
  }
}

int main() {

  int exit = open_db();

  check_env("HOST", HOST);

  char *messageError;

  exit =
      sqlite3_exec(DB_PTR, CREATE_USER_TABLE.c_str(), NULL, 0, &messageError);

  if (exit != SQLITE_OK) {
    std::cerr << "ERROR: creating table:\n" << messageError << std::endl;
    sqlite3_free(messageError);
  }

  // Auth filter to set CORS policy
  auto auth_filter = std::make_shared<CorsFilter>();
  // Auth post handling advice to set CORS policy
  app().registerPostHandlingAdvice([](const drogon::HttpRequestPtr &req,
                                      const drogon::HttpResponsePtr &resp) {
    // LOG_DEBUG << "postHandling1";
    resp->addHeader("Access-Control-Allow-Origin", HOST);
  });

  app()
      // filter to check for cors allowed origin
      .registerFilter(auth_filter)
      // Set HTTP listener address and port
      // Run HTTP framework,the method will block in the internal event loop
      .addListener("0.0.0.0", 8007)
      .run();

  exit = close_db();
  return 0;
}

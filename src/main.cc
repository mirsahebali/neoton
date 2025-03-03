#include "setup.h"
#include <drogon/HttpAppFramework.h>
#include <drogon/HttpFilter.h>
#include <drogon/HttpResponse.h>
#include <memory>
#include <stdlib.h>
#include <trantor/utils/Logger.h>

using namespace drogon;

static const std::string DEV_ENV = std::getenv("DEV_ENV");

static const std::string PROD_HOST =
    std::getenv("PROD_HOST") != NULL ? std::getenv("PROD_HOST") : "";

static const std::string HOST =
    DEV_ENV == "dev" ? "http://localhost:5173" : PROD_HOST;

class CorsFilter : public HttpFilter<CorsFilter, false> {
public:
  void doFilter(const HttpRequestPtr &req, FilterCallback &&filter_callback,
                FilterChainCallback &&filter_chain_callback) override {

    auto resp = HttpResponse::newHttpResponse();

    resp->addHeader("Access-Control-Allow-Origin", HOST);

    resp->addHeader("Access-Control-Allow-Methods",
                    "POST, PUT, DELETE, GET, OPTIONS");

    resp->addHeader("Access-Control-Allow-Headers",
                    "Content-Type, x-requested-with");
    filter_callback(resp);
  }
};

int main() {

  create_db("neolink.db", 5);

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
  return 0;
}

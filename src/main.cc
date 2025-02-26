/*#include "db/setup.h"*/
#include <drogon/HttpAppFramework.h>
#include <trantor/utils/Logger.h>

using namespace drogon;

int main() {

  /*auto db = create_db("neolink.db", 5);*/

  app().registerHandler(
      "/", [](const HttpRequestPtr &,
              std::function<void(const HttpResponsePtr &)> &&callback) {
        auto resp = HttpResponse::newHttpResponse();
        resp->setBody("Hello");
        callback(resp);
      });
  // Set HTTP listener address and port
  app().addListener("0.0.0.0", 8080);

  // Load config file
  // drogon::app().loadConfigFile("../config.json");
  // Run HTTP framework,the method will block in the internal event loop

  app().run();
  return 0;
}

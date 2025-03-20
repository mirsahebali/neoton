#include "auth_controller.h"
#include <drogon/HttpResponse.h>
#include <drogon/HttpTypes.h>
#include <iostream>
#include <json/value.h>
#include <memory>
#include <trantor/utils/Logger.h>

using namespace api::v1;

void User::login_user(const HttpRequestPtr &req,
                      std::function<void(const HttpResponsePtr &)> &&callback) {

  auto body = req->getJsonObject();

  Json::Value return_response;

  auto resp = HttpResponse::newHttpJsonResponse(return_response);

  if (!body) {
    callback(std::move(resp));
  }

  Json::Value json_body = *body;

  std::cout << json_body["email"] << '\n';

  callback(std::move(resp));
};

void User::get_user(const HttpRequestPtr &req,
                    std::function<void(const HttpResponsePtr &)> &&callback) {
  std::cout << "Helloooooo\n";

  callback(HttpResponse::newHttpResponse());
}

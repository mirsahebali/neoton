#include "user_controllers.h"
#include <iostream>

using namespace users::v1;

void UserController::login_user(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback,
    std::string &&email, const std::string &hashed_password) {
  LOG_DEBUG << "User " << email << "login ";
  Json::Value return_value;
  return_value["result"] = "ok";
  return_value["token"] = drogon::utils::getUuid();

  auto resp = HttpResponse::newHttpJsonResponse(return_value);
  callback(*resp);
};

void UserController::get_user(
    const HttpRequestPtr &req,
    std::function<void(const HttpResponsePtr &)> &&callback) {
  std::cout << "Foooooo\n";
  auto resp = HttpResponse::newHttpResponse();
  resp->setBody("this is returning something?");
  callback(resp);
}

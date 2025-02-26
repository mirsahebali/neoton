#pragma once

#include <drogon/HttpController.h>
#include <drogon/HttpRequest.h>
#include <functional>

using namespace drogon;

namespace users {
namespace v1 {
class UserController : public drogon::HttpController<UserController> {
public:
  METHOD_LIST_BEGIN
  METHOD_ADD(UserController::get_user, "/user/get", Get);
  METHOD_ADD(UserController::login_user, "/user/login", Post);
  METHOD_ADD(UserController::signup_user, "/user/signup", Post);
  METHOD_ADD(UserController::delete_user, "/user/delete", Delete);
  METHOD_ADD(UserController::update_user, "/user/update", Patch);
  METHOD_LIST_END

  void get_user(const HttpRequestPtr &req,
                std::function<void(const HttpResponsePtr &)> &&callback);
  void get_users(const HttpRequestPtr &req,
                 std::function<void(const HttpResponsePtr &)> &&callback,
                 std::string &&email, const std::string &hashed_password);
  void login_user(const HttpRequestPtr &req,
                  std::function<void(const HttpResponsePtr &)> &&callback,
                  std::string &&email, const std::string &hashed_password);
  void signup_user(const HttpRequestPtr &req,
                   std::function<void(const HttpResponsePtr &)> &&callback,
                   std::string &&email, const std::string &hashed_password);
  void delete_user(const HttpRequestPtr &req,
                   std::function<void(const HttpResponsePtr &)> &&callback,
                   std::string &&email, const std::string &hashed_password);
  void update_user(const HttpRequestPtr &req,
                   std::function<void(const HttpResponsePtr &)> &&callback,
                   std::string &&email, const std::string &hashed_password);
};
} // namespace v1
} // namespace users

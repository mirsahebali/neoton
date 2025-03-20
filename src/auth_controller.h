#pragma once

#include <drogon/HttpController.h>
#include <drogon/HttpRequest.h>
#include <functional>

using namespace drogon;

namespace api {
namespace v1 {
class User : public drogon::HttpController<User> {
public:
  METHOD_LIST_BEGIN
  METHOD_ADD(User::get_user, "/get", Get);
  METHOD_ADD(User::login_user, "/login", Post, Options);
  /*METHOD_ADD(User::signup_user, "/signup", Post);*/
  /*METHOD_ADD(User::delete_user, "/delete", Delete);*/
  /*METHOD_ADD(User::update_user, "/update", Patch);*/
  METHOD_LIST_END

  void get_user(const HttpRequestPtr &req,
                std::function<void(const HttpResponsePtr &)> &&callback);
  /*void get_users(const HttpRequestPtr &req,*/
  /*               std::function<void(const HttpResponsePtr &)> &&callback,*/
  /*               std::string &&email, const std::string &hashed_password);*/
  void login_user(const HttpRequestPtr &req,
                  std::function<void(const HttpResponsePtr &)> &&callback);
  /*void signup_user(const HttpRequestPtr &req,*/
  /*                 std::function<void(const HttpResponsePtr &)> &&callback,*/
  /*                 std::string &&email, const std::string &hashed_password);*/
  /*void delete_user(const HttpRequestPtr &req,*/
  /*                 std::function<void(const HttpResponsePtr &)> &&callback,*/
  /*                 std::string &&email, const std::string &hashed_password);*/
  /*void update_user(const HttpRequestPtr &req,*/
  /*                 std::function<void(const HttpResponsePtr &)> &&callback,*/
  /*                 std::string &&email, const std::string &hashed_password);*/
};
} // namespace v1
} // namespace api

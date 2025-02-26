#pragma once

#include <drogon/orm/DbClient.h>
#include <string>

drogon::orm::DbClientPtr create_db(std::string db_name, int pool);

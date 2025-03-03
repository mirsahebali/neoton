#include "setup.h"
#include <drogon/orm/DbClient.h>

using namespace drogon;

orm::DbClientPtr create_db(std::string db_name, size_t pool) {
  return orm::DbClient::newSqlite3Client("filename=" + db_name, pool);
}

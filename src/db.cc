#include "db.h"
#include "sqlite3.h"
#include <iostream>

int open_db() {

  int exit = 0;

  exit = sqlite3_open("neolink.db", &DB_PTR);

  if (exit) {
    std::cout << "ERROR: opening DB: " << sqlite3_errmsg(DB_PTR) << std::endl;
    return exit;
  }

  std::cout << "INFO: DB opened successfully" << std::endl;
  return 0;
}

int close_db() { return sqlite3_close(DB_PTR); }

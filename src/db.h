#pragma once
#include "sqlite3.h"
#include <cstddef>

// NOLINTNEXTLINE
inline sqlite3 *DB_PTR = NULL;

int open_db();

int close_db();

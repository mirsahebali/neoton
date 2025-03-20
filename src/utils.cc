#include "utils.h"
#include <chrono>

auto get_current_time() -> long {

  auto now = std::chrono::system_clock::now();

  auto now_ms = std::chrono::time_point_cast<std::chrono::milliseconds>(now);

  auto since_epoch = now_ms.time_since_epoch();

  auto value =
      std::chrono::duration_cast<std::chrono::milliseconds>(since_epoch);

  long duration = value.count();

  return duration;
}

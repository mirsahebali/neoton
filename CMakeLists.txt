cmake_minimum_required(VERSION 3.15)

project(neolink LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Boost REQUIRED)
find_package(Drogon REQUIRED)
find_package(cpp-jwt REQUIRED)

message("Building with CMake version: ${CMAKE_VERSION}")


set(PROJECT_SOURCE_DIR src)
set(DB_SOURCE_DIR src/db)
set(CONTROLLER_SOURCE_DIR src/controllers)
set(MIDDLEWARE_SOURCE_DIR src/middlewares)
set(UTILS_DIR src/utils)
set(SCHEMA_DIR src/schema)

file(GLOB DB_FILES ${PROJECT_SOURCE_DIR}/db/*.cc)
file(GLOB SCHEMA_FILES ${PROJECT_SOURCE_DIR}/schema/*.cc)
file(GLOB CONTROLLER_FILES ${PROJECT_SOURCE_DIR}/controllers/*.cc)
file(GLOB MIDDLEWARE_FILES ${PROJECT_SOURCE_DIR}/middlewares/*.cc)
file(GLOB UTILS_FILES ${PROJECT_SOURCE_DIR}/utils/*.cc)

include_directories(${PROJECT_SOURCE_DIR})
include_directories(${DB_SOURCE_DIR})
include_directories(${CONTROLLER_SOURCE_DIR})
include_directories(${MIDDLEWARE_SOURCE_DIR})
include_directories(${UTILS_DIR})
include_directories(${SCHEMA_DIR})


file(GLOB SRC_FILES CONFIGURE_DEPENDS ${PROJECT_SOURCE_DIR}/*.cc)

add_executable(${PROJECT_NAME}
		${DB_FILES}
		${SRC_FILES} 
		${UTILS_FILES}
		${SCHEMA_FILES}
		${MIDDLEWARE_FILES}
		${CONTROLLER_FILES})



target_link_libraries(${PROJECT_NAME} boost::boost Drogon::Drogon cpp-jwt::cpp-jwt)

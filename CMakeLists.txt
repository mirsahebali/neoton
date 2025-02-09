cmake_minimum_required(VERSION 3.15)

project(neolink LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Boost REQUIRED)
find_package(Drogon REQUIRED)

message("Building with CMake version: ${CMAKE_VERSION}")

set(PROJECT_SOURCE_DIR src)

include_directories(${PROJECT_SOURCE_DIR})

file(GLOB SRC_FILES ${PROJECT_SOURCE_DIR}/*.cc)

add_executable(${PROJECT_NAME} ${SRC_FILES})

target_link_libraries(${PROJECT_NAME} boost::boost Drogon::Drogon)
